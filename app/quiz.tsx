import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { questions } from "../question";

export default function Quiz() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(questions.length).fill(null),
  );

  const handleSelect = (choice: string) => {
    const updated = [...answers];
    updated[current] = choice;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      let score = 0;
      answers.forEach((a: string | null, i: number) => {
        if (a === questions[i].answer) score++;
      });

      router.push({
        pathname: "/result",
        params: { score },
      });
    }
  };

  const handlePrevious = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questions[current].question}</Text>

      {Object.entries(questions[current].choices).map(
        ([key, choice]: [string, any]) => (
          <TouchableOpacity
            key={key}
            style={[styles.option, answers[current] === key && styles.selected]}
            onPress={() => handleSelect(key)}
          >
            <Text>
              {key}: {choice as string}
            </Text>
          </TouchableOpacity>
        ),
      )}

      <View style={styles.buttons}>
        <Button
          title="Previous"
          onPress={handlePrevious}
          disabled={current === 0}
        />
        <Button
          title={current === questions.length - 1 ? "Finish" : "Next"}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  option: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: "#d0ebff",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
