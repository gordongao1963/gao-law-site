"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";

export default function Page() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askAI = () => {
    setAnswer("Analyzing based on firm precedent and strategic perspective...");

    setTimeout(() => {
      setAnswer(
        "Drawing on landmark matters such as Michael Jordan v. Qiaodan Sports and Apple v. Qualcomm, successful IP strategy depends on understanding jurisdictional realities rather than assumptions."
      );
    }, 1500);
  };

  return (
    <div className="container">
      <h1>Elite Cross-Border IP Litigation</h1>
      <p>Strategic litigation at the intersection of global enforcement and defense</p>

      <div className="grid">
        <Card>
          <CardContent>
            <h3>Michael Jordan v. Qiaodan Sports</h3>
            <p>Trademark precedent in China.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3>Apple v. Qualcomm</h3>
            <p>Global patent litigation strategy.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3>Ineos v. Sinopec</h3>
            <p>Cross-border IP enforcement.</p>
          </CardContent>
        </Card>
      </div>

      <h2>Ask Our AI</h2>
      <input
        placeholder="Ask about IP strategy..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <Button onClick={askAI}>Ask</Button>

      {answer && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {answer}
        </motion.div>
      )}
    </div>
  );
}