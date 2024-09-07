import express from "express";
import mammoth from "mammoth";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.static("public"));

// Función para leer todos los archivos DOCX en la carpeta
async function loadAllDocx(folderPath) {
  const files = fs.readdirSync(folderPath);
  let combinedText = "";

  for (const file of files) {
    if (file.endsWith(".docx")) {
      const filePath = `${folderPath}/${file}`;
      try {
        const text = await loadDocx(filePath);
        combinedText += text + "\n"; // Concatena
      } catch (error) {
        console.error(
          `Error al procesar el archivo ${filePath}: ${error.message}`
        );
        // Se puede registrar el error o hacer otra cosa
      }
    }
  }

  return combinedText;
}

// Lee y combina todos los archivos Word
app.get("/read-files", async (req, res) => {
  const textContent = await loadAllDocx("./files"); //Maneja todos los archivos

  res.json({ textContent });
});

// Ruta para hacer la consulta a OpenAI
/* app.post('/ask', express.json(), async (req, res) => {
    const question = req.body.question;
    const textContent = req.body.textContent;

    const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': Bearer ${process.env.OPENAI_API_KEY}
        },
        body: JSON.stringify({
            model: 'gpt-4',
            prompt: ${textContent}\n\nPregunta: ${question}\nRespuesta:,
            max_tokens: 150
        })
    });

    const data = await response.json();
    res.json({ answer: data.choices[0].text.trim() });
}); */

// Consulta LLM STUDIO
app.post("/ask", express.json(), async (req, res) => {
  const question = req.body.question;
  const textContent = req.body.textContent;

  const response = await fetch(
    "https://6847-2806-2a0-e26-8120-74d5-8f31-4ef3-abdb.ngrok-free.app/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LLM_STUDIO_API_KEY}`,
      },
      body: JSON.stringify({
        model: "TheBloke/OpenHermes-2.5-Mistral-7B-GGUF",
        messages: [
          {
            role: "system",
            content:
              "Eres un bot que resuelve dudas a la medida, amable y cortes.",
          },
          { role: "user", content: `${textContent}\n\nPregunta: ${question}` },
        ],
        temperature: 0.7,
      }),
    }
  );

  const data = await response.json();
  res.json({ answer: data.choices[0].message.content.trim() });
});

// Función para leer DOCX
async function loadDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
