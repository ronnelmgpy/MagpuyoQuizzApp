import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { questions as defaultQuestions } from "../question";

interface Question {
  id: number;
  type: string;
  question: string;
  choices: { [key: string]: string };
  answer: string | string[];
}

export default function Quiz() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"preview" | "settings">("preview");
  const [quizItems, setQuizItems] = useState<Question[]>(defaultQuestions);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(defaultQuestions.length).fill(null),
  );
  const [timerDuration, setTimerDuration] = useState(300); // 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(300);
  const [quizStarted, setQuizStarted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>({
    question: "",
    choices: { A: "", B: "", C: "", D: "" },
    answer: "A",
    type: "multiple",
  });

  // Timer effect
  useEffect(() => {
    if (!quizStarted || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, timeLeft]);

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(timerDuration);
    setAnswers(Array(quizItems.length).fill(null));
    setCurrent(0);
  };

  const submitQuiz = () => {
    let score = 0;
    answers.forEach((a: string | null, i: number) => {
      if (a === quizItems[i].answer) score++;
    });

    router.push({
      pathname: "/result",
      params: { score },
    });
  };

  const handleSelect = (choice: string) => {
    const updated = [...answers];
    updated[current] = choice;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < quizItems.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handlePrevious = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      question: "",
      choices: { A: "", B: "", C: "", D: "" },
      answer: "A",
      type: "multiple",
    });
    setModalVisible(true);
  };

  const openEditModal = (item: Question) => {
    setEditingId(item.id);
    setFormData(item);
    setModalVisible(true);
  };

  const saveQuizItem = () => {
    if (!formData.question || !formData.choices) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (editingId) {
      setQuizItems(
        quizItems.map((item) =>
          item.id === editingId
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      const newId = Math.max(...quizItems.map((q) => q.id), 0) + 1;
      setQuizItems([...quizItems, { id: newId, ...formData as Question }]);
    }

    setModalVisible(false);
  };

  const deleteQuizItem = (id: number) => {
    Alert.alert("Delete Item", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setQuizItems(quizItems.filter((item) => item.id !== id)),
      },
    ]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "preview" && styles.activeTab]}
          onPress={() => setActiveTab("preview")}
        >
          <Text style={[styles.tabText, activeTab === "preview" && styles.activeTabText]}>
            Preview Quiz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>
            Quiz Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preview Quiz Tab */}
      {activeTab === "preview" && (
        <ScrollView style={styles.tabContent}>
          {!quizStarted ? (
            <View style={styles.startContainer}>
              <Text style={styles.startTitle}>Quiz Settings</Text>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Timer Duration (seconds):</Text>
                <Text style={styles.timerValue}>{timerDuration} seconds</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Total Questions:</Text>
                <Text style={styles.timerValue}>{quizItems.length}</Text>
              </View>
              <Button title="Start Quiz" onPress={startQuiz} color="#007AFF" />
            </View>
          ) : (
            <>
              {/* Timer Display */}
              <View style={styles.timerDisplay}>
                <Text style={styles.timerLabel}>Time Left:</Text>
                <Text style={[styles.timer, timeLeft < 60 && styles.timerWarning]}>
                  {formatTime(timeLeft)}
                </Text>
              </View>

              {/* Question Display */}
              <Text style={styles.question}>{quizItems[current]?.question}</Text>

              {Object.entries(quizItems[current]?.choices || {}).map(
                ([key, choice]: [string, any]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.option,
                      answers[current] === key && styles.selected,
                    ]}
                    onPress={() => handleSelect(key)}
                  >
                    <Text>
                      {key}: {choice as string}
                    </Text>
                  </TouchableOpacity>
                ),
              )}

              {/* Navigation Buttons */}
              <View style={styles.buttons}>
                <Button
                  title="Previous"
                  onPress={handlePrevious}
                  disabled={current === 0}
                />
                <Text style={styles.progressText}>
                  {current + 1} / {quizItems.length}
                </Text>
                {current === quizItems.length - 1 ? (
                  <Button title="Submit" onPress={submitQuiz} color="#28a745" />
                ) : (
                  <Button title="Next" onPress={handleNext} />
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* Quiz Settings Tab */}
      {activeTab === "settings" && (
        <ScrollView style={styles.tabContent}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Timer Settings</Text>
            <View style={styles.timerInput}>
              <Text style={styles.inputLabel}>Duration (seconds):</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={String(timerDuration)}
                onChangeText={(text) => setTimerDuration(parseInt(text) || 0)}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemsHeader}>
            <Text style={styles.settingsTitle}>Quiz Items</Text>
            <Button title="+ Add Item" onPress={openAddModal} color="#007AFF" />
          </View>

          <FlatList
            data={quizItems}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={styles.listItem}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemNumber}>{index + 1}.</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemQuestion} numberOfLines={2}>
                      {item.question}
                    </Text>
                    <Text style={styles.itemType}>{item.type}</Text>
                  </View>
                </View>
                <View style={styles.itemButtons}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditModal(item)}
                  >
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteQuizItem(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Question" : "Add Question"}
            </Text>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.formLabel}>Question:</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter question"
                value={formData.question || ""}
                onChangeText={(text) =>
                  setFormData({ ...formData, question: text })
                }
                multiline
              />

              <Text style={styles.formLabel}>Type:</Text>
              <View style={styles.typeButtons}>
                {["multiple", "truefalse"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeBtn,
                      formData.type === type && styles.typeBtnActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        formData.type === type && styles.typeBtnTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Choices:</Text>
              {Object.keys(formData.choices || {}).map((key) => (
                <View key={key} style={styles.choiceInput}>
                  <Text style={styles.choiceLabel}>{key}:</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={`Enter choice ${key}`}
                    value={formData.choices?.[key] || ""}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        choices: { ...formData.choices, [key]: text },
                      })
                    }
                  />
                </View>
              ))}

              <Text style={styles.formLabel}>Correct Answer:</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter correct answer (e.g., A)"
                value={String(formData.answer || "")}
                onChangeText={(text) =>
                  setFormData({ ...formData, answer: text })
                }
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                color="#999"
              />
              <Button title="Save" onPress={saveQuizItem} color="#28a745" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  startContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  settingItem: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  timerValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "#f0f8ff",
    padding: 16,
    borderRadius: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  timer: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
  },
  timerWarning: {
    color: "#ff4444",
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  option: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  selected: {
    backgroundColor: "#d0ebff",
    borderColor: "#007AFF",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  settingsHeader: {
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  timerInput: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 16,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    marginRight: 12,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 12,
    color: "#007AFF",
  },
  itemDetails: {
    flex: 1,
  },
  itemQuestion: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  itemType: {
    fontSize: 12,
    color: "#999",
  },
  itemButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#e3f2fd",
    borderRadius: 4,
  },
  editBtnText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 12,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#ffebee",
    borderRadius: 4,
  },
  deleteBtnText: {
    color: "#d32f2f",
    fontWeight: "600",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  formScroll: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    alignItems: "center",
  },
  typeBtnActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  typeBtnText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  typeBtnTextActive: {
    color: "#fff",
  },
  choiceInput: {
    marginBottom: 12,
  },
  choiceLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "600",
    color: "#666",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 24,
  },
});
