import "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

//GET /health - Health-check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: "ok" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servern kör på http://localhost:${port}`);
})