import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Linking,
    Pressable,
    StyleSheet,
    Text
} from "react-native";

type PubMedSummary = {
  uid: string;
  title: string;
  fulljournalname?: string;
};

export default function PubMedWidget() {
  const [papers, setPapers] = useState<PubMedSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  async function fetchResearch() {
    try {
      setLoading(true);

      const searchRes = await fetch(
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=dermatology&retmax=5&sort=date&retmode=json"
      );

      const data: any = await searchRes.json();
      const ids: string[] = (data?.esearchresult?.idlist ?? []) as string[];

      if (!ids.length) {
        setPapers([]);
        setLoading(false);
        return;
      }

      const detailsRes = await fetch(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(
          ","
        )}&retmode=json`
      );

      const details: any = await detailsRes.json();

      const items: PubMedSummary[] = (Object.values(details.result || {}) as any[])
        .filter((x: any) => x && x.uid)
        .map((x: any) => ({
          uid: String(x.uid),
          title: String(x.title ?? x["title"]),
          fulljournalname: x.fulljournalname,
        }));

      setPapers(items);
    } catch (e) {
      console.warn("PubMed fetch error", e);
      setPapers([]);
    } finally {
      setLoading(false);

      // Fade-in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      // Floating card animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -5,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }

  useEffect(() => {
    fetchResearch();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ translateY: floatAnim }],
        },
      ]}
    >
      <Text style={styles.header}>🧬 Latest Dermatology Research</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#007bff" style={{ marginTop: 8 }} />
      ) : papers.length === 0 ? (
        <Text style={styles.emptyText}>No recent papers found.</Text>
      ) : (
        papers.map((paper, index) => (
          <Animated.View
            key={paper.uid}
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10 * (index + 1), 0],
                  }),
                },
              ],
            }}
          >
            <Pressable
              style={styles.paperItem}
              android_ripple={{ color: "#ddd" }}
              onPress={() =>
                Linking.openURL(`https://pubmed.ncbi.nlm.nih.gov/${paper.uid}`)
              }
            >
              <Text style={styles.title}>{paper.title}</Text>
              <Text style={styles.journal}>
                {paper.fulljournalname || "PubMed Journal"}
              </Text>
            </Pressable>
          </Animated.View>
        ))
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 18,
    marginTop: 25,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#112",
  },
  paperItem: {
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  journal: {
    fontSize: 12,
    marginTop: 3,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    paddingVertical: 10,
  },
});
