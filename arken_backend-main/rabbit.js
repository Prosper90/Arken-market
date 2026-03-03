const amqp = require("amqplib");
const { randomUUID: uuidv4 } = require("crypto");

let channel = null;

async function connectRabbit() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  console.log("RabbitMQ Producer Connected");

  connection.on("close", () => {
    console.warn("RabbitMQ producer connection closed — reconnecting in 5 s...");
    channel = null;
    setTimeout(_reconnect, 5000);
  });

  connection.on("error", (err) => {
    console.error("RabbitMQ producer error:", err.message);
  });
}

async function _reconnect() {
  try {
    await connectRabbit();
    console.log("RabbitMQ producer reconnected");
  } catch (err) {
    console.error("Producer reconnect failed:", err.message, "— retrying in 5 s");
    setTimeout(_reconnect, 5000);
  }
}

function publish(queue, data) {
  if (!channel) throw new Error("Rabbit channel not ready");

  channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );

  console.log("Sent to queue:", queue, data);
}

async function publishAndWait(queue, data, timeout = 30000) {
  if (!channel) throw new Error("Rabbit channel not ready");

  const { queue: replyQueue } = await channel.assertQueue("", { exclusive: true });

  const correlationId = uuidv4(); // UNIQUE ID

  return new Promise((resolve, reject) => {

    // Timeout safety
    const timer = setTimeout(() => {
      reject(new Error("RPC timeout"));
    }, timeout);

    // Start consumer
    const consumerTag = `ctag-${uuidv4()}`;
    channel.consume(
      replyQueue,
      (msg) => {
        if (msg.properties.correlationId === correlationId) {
          clearTimeout(timer);
          resolve(JSON.parse(msg.content.toString()));

          // IMPORTANT: cancel this consumer after one reply
          channel.cancel(consumerTag);
        }
      },
      {
        noAck: true,
        consumerTag,
      }
    );

    // Send message
    channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(data)),
      {
        correlationId,
        replyTo: replyQueue,
        persistent: true,
      }
    );
  });
}

module.exports = { connectRabbit, publish, publishAndWait };
