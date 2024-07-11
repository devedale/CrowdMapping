import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
    console.log(`LOGGER: [${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('\nLOGGER: Request headers:', req.headers);
    console.log('LOGGER: Request body:', req.body);

    const oldSend = res.send;
    res.send = function(data) {
        // Logga la risposta ricevuta prima di inviarla al client
        console.log('LOGGER: Response headers:', res.getHeaders());
        console.log('LOGGER: Response: Logging response data:', data);

        // Invoca la funzione originale di send di Express per effettuare l'invio effettivo
        // Utilizzando bind per mantenere il contesto 'this' corretto e passando 'data' come parametro
        return oldSend.bind(this, data)();
    };

    next(); 
};
