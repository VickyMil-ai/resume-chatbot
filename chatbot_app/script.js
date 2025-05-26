const chatbox = document.getElementById("chatbox");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

function appendMessage(sender, text) {
    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("mb-2", sender.toLowerCase() === "you" ? "text-end" : "text-start");

    const msgDiv = document.createElement("div");
    msgDiv.classList.add("d-inline-block", "p-2", "rounded", "text-wrap");

    if (sender.toLowerCase() === "you") {
        msgDiv.classList.add("user-bubble");
        msgDiv.innerHTML = `<strong>You:</strong> ${text}`;
    } else {
        msgDiv.classList.add("bot-bubble");
        msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    }

    wrapperDiv.appendChild(msgDiv);
    chatbox.appendChild(wrapperDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".sample-btn").forEach(button => {
      button.addEventListener("click", () => {
        const userPrompt = button.textContent;
        document.getElementById("user-input").value = userPrompt;
        document.getElementById("chat-form").dispatchEvent(new Event("submit"));
      });
    });
  });

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = userInput.value.trim();
    if (!userText) return;

    appendMessage("You", userText);

    try {
        const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: userText })
        });

        const data = await res.json();
        appendMessage("Bot", data.response);
    } catch (err) {
        console.error(err);
        appendMessage("Bot", "Oops! Something went wrong.");
    }

    userInput.value = "";
    userInput.focus();
});

window.onload = () => {
    appendMessage('Bot', "Hello! I am Vicky's resume chatbot. Ask me a question!");
  };
