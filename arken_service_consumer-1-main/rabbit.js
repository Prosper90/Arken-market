// rabbit.js
const amqp = require('amqplib');

let channel = null;
let _onReconnect = null; // callback to re-register consumers after reconnect

async function connectRabbit(onReconnect) {
  if (onReconnect) _onReconnect = onReconnect;

  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();
  console.log('RabbitMQ connected');

  // When RabbitMQ closes the connection (restart, crash, etc.),
  // null out the channel and retry after 5 seconds.
  conn.on('close', () => {
    console.warn('RabbitMQ connection closed — reconnecting in 5 s...');
    channel = null;
    setTimeout(_reconnect, 5000);
  });

  conn.on('error', (err) => {
    console.error('RabbitMQ connection error:', err.message);
    // 'close' event fires right after 'error', so reconnect is handled there.
  });

  return channel;
}

async function _reconnect() {
  try {
    await connectRabbit(); // reuses stored _onReconnect
    console.log('RabbitMQ reconnected — re-registering consumers...');
    if (_onReconnect) await _onReconnect();
    console.log('Consumers re-registered');
  } catch (err) {
    console.error('Reconnect attempt failed:', err.message, '— retrying in 5 s');
    setTimeout(_reconnect, 5000);
  }
}

function getChannel() {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  return channel;
}

module.exports = { connectRabbit, getChannel };
