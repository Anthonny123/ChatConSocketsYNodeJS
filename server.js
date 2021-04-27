const {Server} = require ('net');

const host = '0.0.0.0';

const END = 'END';

const connections = new Map();

const error = (err) =>{
    console.error(err);
    process.exit(1);
};

const sendMessage = (message, origin) =>{
    //Mandar a todos menos a origin el messsage
    for(const socket of connections.keys()){
        if(socket !== origin){
            socket.write(message);
        }
    }
}

const listen = (port) =>{
    const server = new Server();

    server.on('connection', (socket) =>{
        const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`New Connection from ${remoteSocket}`);
        socket.setEncoding('utf-8');

        socket.on('data', (message) =>{
            if(!connections.has(socket)){
                console.log(`Username ${message} set for connection ${remoteSocket}`);
                connections.set(socket, message);
            }
            else if(message === END){
                connections.delete(socket);
                socket.end();
            }else{
                //Enviar el msg al resto de clientes
                const fullMessage = `[${connections.get(socket)}]: ${message}`;
                console.log(`${remoteSocket} -> ${fullMessage}`);
                sendMessage(fullMessage, socket);
            }
        });

        socket.on('close', () =>{
            console.log(`Connectrion with ${remoteSocket} closed`);
        });

        socket.on('error', (err) => error(err.message));
    });

    server.listen({port, host}, () =>{
        console.log('Listening on port 8000');
    });

    server.on('error', (err)=>{error(err.message)});
}

const main = () =>{
    if(process.argv.length !== 3){
        error(`Usage: node ${__filename} port`);
    }

    let port = process.argv[2];
    if(isNaN(port)){
        error(`Invalid port ${port}`);
    }
    port = Number(port);
    listen(port);
}

if(require.main === module){
    main();
}
