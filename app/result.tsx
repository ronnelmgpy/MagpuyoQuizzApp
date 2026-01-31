import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Result() {
  const { score } = useLocalSearchParams<{ score: string }>();
  const router = useRouter();
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saveHighScore = async () => {
      const stored = await AsyncStorage.getItem("highScore");
      const best = stored ? Number(stored) : 0;
      const current = Number(score);

      if (current > best) {
        await AsyncStorage.setItem("highScore", current.toString());
        setHighScore(current);
      } else {
        setHighScore(best);
      }
    };

    saveHighScore();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>
      <Text style={styles.text}>Your Score: {score}</Text>
      <Text style={styles.text}>Highest Score: {highScore}</Text>

      <Button title="Go Home" onPress={() => router.replace("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
