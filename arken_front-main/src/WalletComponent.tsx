import React from "react";
import { usePhantom, useModal } from "@phantom/react-sdk";

export default function WalletComponent() {
    const { open } = useModal();
    const { isConnected, user } = usePhantom();
    console.log(isConnected, 'isConnected==')

    return (
        <button onClick={open}>
            Connect Phantom Wallet
        </button>
    );
}
