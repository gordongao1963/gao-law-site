-- Insert training Q&A pair about CNIPA damages
INSERT INTO knowledge_base (type, question, answer, category, keywords) VALUES
(
  'qa',
  'Can I ask for damages in a National Major Patent Infringement case in China?',
  'No, you only get injunction, as the case is reviewed by the CNIPA and not the court. You can file a civil case to ask for damages based on the infringement finding of CNIPA',
  'Patent Litigation',
  ARRAY['damages', 'CNIPA', 'patent infringement', 'injunction', 'National Major Patent', 'civil case']
);
