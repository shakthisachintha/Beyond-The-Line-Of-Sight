class WebSocketClient {
    private static instance: WebSocketClient;
    private socket: WebSocket;

    public static getInstance() {
        if (!WebSocketClient.instance) {
            WebSocketClient.instance = new WebSocketClient('ws://localhost:8081');
        }
        return WebSocketClient.instance;
    }

    private constructor(url: string) {
        this.socket = new WebSocket(url);
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onerror = this.onError.bind(this);
    }

    private onOpen() {
        console.log('Connected to server');
    }

    private onMessage(event: MessageEvent) {
        console.log('Message received:', event.data);
    }

    private onClose() {
        console.log('Disconnected from server');
    }

    private onError(event: Event) {
        console.error('Error:', event);
    }

    public send(data: any) {
        this.socket.send(JSON.stringify(data));
    }

    public subscribe(channel: string) {
        this.send({ type: 'subscribe', channel });
    }
}

export const webSocketClient = WebSocketClient.getInstance();