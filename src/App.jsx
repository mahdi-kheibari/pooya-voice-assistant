import { useEffect, useState } from "react";
import "./App.css";
import Bar from "./components/bars";
import StartRecordingButton from "./components/start-recording";
import { useAudio } from "./hooks/audio";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Get user audio
  const { startRecording, amplitude } = useAudio();
  const [isRecording, setIsRecording] = useState(false); // Track recording state
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([]);
  const [responseLoading, setResponseLoading] = useState(false); // Track recording state
  let recognition = null;

  useEffect(() => {
    // Check local storage on initial render
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUsername(parsedUser?.username);
      setPassword(parsedUser?.password);
      setIsSignedIn(true);
    }
  }, []);

  useEffect(() => {
    if (!isRecording && transcript) {
      const newTranscript = [
        ...messages,
        {
          question: transcript,
          response: "",
        },
      ];
      sendToBackend(newTranscript);
      setTranscript("");
    }
  }, [isRecording]);

  const handleSignIn = (e) => {
    e.preventDefault();
    const userInfo = { username, password };
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    setIsSignedIn(true);
  };

  const sendToBackend = async (newTranscript) => {
    const text = newTranscript?.[newTranscript.length - 1]?.question?.trim();
    setMessages(newTranscript);
    setResponseLoading(true);
    try {
      // const response = await fetch("http://localhost:5000/process-text", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ text, username, password }),
      // });
      // const data = await response.json();
      const data = { response: "سلام این یک پاسخ تستی است" };
      const newMessage = {
        question: text,
        response: data.response,
      };
      const newMessages =
        newTranscript.length > 1
          ? [...newTranscript.slice(0, newTranscript.length - 1), newMessage]
          : [newMessage];
      setMessages(newMessages);

      // Convert the response text to voice
      playResponseText(data.response);
    } catch (error) {
      console.error("Error sending text to backend:", error);
    }
    setResponseLoading(false);
  };

  const playResponseText = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fa-IR"; // Set language to Persian (Farsi)
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support the Web Speech API.");
    }
  };

  const handleSpeechToText = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = "fa-IR"; // Persian language
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript((prev) => prev + " " + finalTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.start();
    } else {
      alert("Sorry, your browser does not support the Web Speech API.");
    }
  };

  const startAudioRecording = () => {
    setIsRecording(true);
    startRecording();
    handleSpeechToText();
  };

  const stopAudioRecording = () => {
    setIsRecording(false);
    if (recognition) {
      recognition.stop(); // Stop speech recognition
    }
    window.speechSynthesis.cancel(); // Cancel any ongoing speech synthesis
  };

  return (
    <div
      dir="rtl"
      className={`w-svw h-svh overflow-hidden flex flex-col gap-4 p-4 md:p-8 lg:px-20`}
    >
      {!isSignedIn ? (
        <div className="sm:mx-auto h-full flex items-center sm:w-full sm:max-w-sm text-white">
          <form className="w-full space-y-6" onSubmit={handleSignIn}>
            <div>
              <label
                htmlFor="username"
                className="block font-medium text-right"
              >
                نام کاربری
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md bg-gray-500/50 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                />
              </div>
            </div>

            <div>
              <div>
                <label
                  htmlFor="password"
                  className="block font-medium text-right"
                >
                  رمز عبور
                </label>
              </div>
              <div className="mt-2">
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-gray-500/50 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-slate-900 px-3 py-2 font-semibold text-white shadow-xs hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                ورود به سامانه
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="grow overflow-y-auto scroll-ml-2">
            {messages?.map((text, index) => (
              <div key={index} className="w-full mb-2.5 flex flex-col gap-2.5">
                <div className="p-4 bg-white/85 text-slate-900 rounded-2xl rounded-tr-none max-w-[75%] ml-auto">
                  <p>{text?.question || "..."}</p>
                </div>
                <div className="p-4 bg-gray-900/85 text-white rounded-2xl rounded-tl-none max-w-[75%] mr-auto">
                  <h3 className="font-semibold text-right">پاسخ : </h3>
                  {index !== messages?.length - 1 || !responseLoading ? (
                    <p>{text?.response || ""}</p>
                  ) : (
                    <div class="flex space-x-1 justify-center items-center mt-3 dark:invert">
                      <span class="sr-only">Loading...</span>
                      <div class="h-2 w-2 bg-gray-900 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div class="h-2 w-2 bg-gray-900 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div class="h-2 w-2 bg-gray-900 rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="shrink-0 relative h-32 flex items-center justify-center">
            <div
              className={`${
                messages?.length > 0 &&
                !messages?.[messages?.length - 1]?.response
                  ? "opacity-50 pointer-events-none"
                  : ""
              }`}
            >
              <StartRecordingButton
                startRecording={startAudioRecording}
                isRecording={isRecording}
              />
            </div>
            {isRecording && (
              <section
                onClick={stopAudioRecording}
                className="flex items-center gap-2 w-fit"
              >
                <Bar amplitude={amplitude} multiplier={0.4} delay={0} />
                <Bar amplitude={amplitude} multiplier={1} delay={20} />
                <Bar amplitude={amplitude} multiplier={1} delay={40} />
                <Bar amplitude={amplitude} multiplier={0.4} delay={60} />
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
