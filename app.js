const express = require('express');
const app = express();
const clients = {};
const serverIP = '172.21.101.30:8080';
const template = `
<!DOCTYPE html>
<html>
<body>
    <button id='getSSEIDButton'>Get SSE ID</button>
    <button id='connectButton'>Connect Server</button>
    <br/>
    <span>ID info: </span><span id='idInfo'></span>
    <br/>
    <hr>
    <span>Messages</span>
    <br>
    <div id='messageBox'></div>

    <script type='text/javascript' src='https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js'></script>
    <script type='text/javascript'>
        const idBt = document.getElementById('getSSEIDButton');
        idBt.addEventListener('click', () => {
            console.log('click id button');
            axios.get('http://${serverIP}/sseId').then(({data}) => {
                document.getElementById('idInfo').textContent = data;
            });
        });

        const connectServerBt = document.getElementById('connectButton');
        connectServerBt.addEventListener('click', () => {
            console.log('click connect server button');
            const id = document.getElementById('idInfo').textContent;

            console.log('id is:', id);

            const messageBox = document.getElementById('messageBox');
            const source = new EventSource('http://${serverIP}/sse/' + id);
            source.onmessage = (message) => {
                console.log('message : ', message);
                const { data } = message;
                const div = document.createElement('div');
                div.append(data);

                messageBox.appendChild(div);
            };
        });

    </script>
</body>
</html>`;

app.get('/', function (req, res) {
	res.send(template);
});

app.get('/sse/:id', function (req, res) {
    const { id } = req.params;
    console.log(`>> /sse/${id}`);

    if (!clients[id]) {
        res.send({
            status:500,
            message: `${id} is not registed or expired, plz call first /sseId api`,
            type:'internal'
        });
    } else {
        req.socket.setTimeout(Number.MAX_VALUE);
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('\n');

        if (!clients[id].res) {
            clients[id].res = res;
        }

        req.on('close', () => {
            clients[id].res = null;
        });

        setInterval(() => {
            const msg = Math.random();
            console.log(`Clients [${id}]: ${msg}`);
            clients[id].res.write(`data: server send random number: ${msg} \n\n`);
        }, 2000);
    }
});

app.get('/sseId/', function (req, res) {
    const id = `id-${Math.random()}`;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    clients[id] = {
        res: null
    };

    console.log(`send sseId: ${id} to ${ip}`);
    res.send(`${id}\n`);
});

app.listen(process.env.PORT || 8080, function () {
    const host = this.address().address;
    const port = this.address().port;
    console.log(`App listening at http://${host}:${port}`);
});
