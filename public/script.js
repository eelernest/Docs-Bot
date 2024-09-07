async function askQuestion() {
  const question = document.getElementById("question").value;

  const textResponse = await fetch("/read-files");
  const { textContent } = await textResponse.json();

  // Enviar la pregunta
  const response = await fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, textContent })
    });


  // Detecta si está en producción o desarrollo
 /*  const baseURL =
    process.env.NODE_ENV === "production"
      ? process.env.PUBLIC_URL
      : "http://localhost:3000";

  // Llamada a la API con la URL base correcta
  const response = await fetch(`${baseURL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, textContent }),
  }); */

  const data = await response.json();
  document.getElementById("response").innerText = data.answer;
}
