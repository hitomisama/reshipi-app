// 必要な依存関係をインポート
import Constants from 'expo-constants'; // Expo設定と環境変数へのアクセス用
import * as ImagePicker from 'expo-image-picker'; // 画像選択機能用
import { useEffect, useState } from 'react'; // 状態管理とライフサイクル用のReactフック
import { ActivityIndicator, Alert, Button, Image, ScrollView, StyleSheet, Text, View } from 'react-native'; // UIコンポーネント

// API設定オブジェクト - Google Vision APIのエンドポイントを定義
const API_CONFIG = {
  endpoint: 'https://vision.googleapis.com/v1/images:annotate' // Google Vision OCR APIのURL
};

export default function OCRScreen() {
  // 状態変数の定義
  const [imageUri, setImageUri] = useState<string | null>(null); // 選択された画像のURIを保存
  const [ocrText, setOcrText] = useState<string>(''); // OCR認識結果のテキストを保存
  const [isLoading, setIsLoading] = useState<boolean>(false); // 読み込み状態の表示制御
  const [apiConfigured, setApiConfigured] = useState<boolean>(false); // APIキーが設定されているかのフラグ
  const [items, setItems] = useState<{ name: string; price: number }[]>([]); // 構造化商品明細を保存
  
  // コンポーネント読み込み時にAPI設定をチェック - useEffectを使用してコンポーネントマウント時に実行
  useEffect(() => {
    // Expo設定からAPIキーの取得を試行
    const apiKey = Constants.expoConfig?.extra?.apiKey;
    if (apiKey) {
      // キーが見つかった場合、API設定済みフラグを立てる
      console.log('APIキーが設定されています');
      setApiConfigured(true);
    } else {
      // キーが見つからない場合、警告を出力
      console.warn('APIキーが設定されていません。OCR機能は利用できません');
    }

    console.log("完全なConstantsオブジェクト:", JSON.stringify(Constants, null, 2));
    console.log("APIキー:", Constants.expoConfig?.extra?.apiKey);
    // または旧バージョンアクセス方式を試行
    console.log("旧バージョンAPIキー:", Constants.manifest?.extra?.apiKey);
  }, []); // 空の依存配列はコンポーネントマウント時のみ実行することを示す

  // 画像選択関数 - ユーザーによる画像選択または撮影のロジックを処理
  const pickImage = async () => {
    try {
      // APIキーが設定されているかチェック、未設定の場合はユーザーに通知
      if (!apiConfigured) {
        Alert.alert('設定エラー', 'APIキーが設定されていません。まずapp.config.jsと.envファイルを設定してください');
        return;
      }
      
      // メディアライブラリアクセス権限をリクエスト
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        // ユーザーが権限を拒否した場合、エラーメッセージを表示
        Alert.alert('権限エラー', 'フォトライブラリへのアクセス権限が必要です');
        return;
      }

      // 画像選択器を開き、編集を許可し、base64形式で取得
      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true, // API呼び出し用にbase64形式データをリクエスト
        allowsEditing: true, // ユーザーによる選択画像の編集を許可
        quality: 1, // 画質を最高に設定
      });

      // ユーザーが画像を選択した場合（キャンセルしていない場合）
      if (!result.canceled) {
        const asset = result.assets[0]; // 選択されたリソースを取得
        setImageUri(asset.uri); // 表示用に画像URIを設定
        if (asset.base64) {
          // base64データの取得に成功した場合、OCR処理に送信
          sendToOCR(asset.base64);
        } else {
          // base64データの取得に失敗した場合、エラーを表示
          Alert.alert('エラー', '画像データを取得できませんでした');
        }
      }
    } catch (error) {
      // 画像選択プロセス中の任意のエラーをキャッチ
      console.error('画像選択エラー:', error);
      Alert.alert('エラー', '画像選択時にエラーが発生しました');
    }
  };

  // 新たに追加された写真撮影関数 - カメラで撮影してOCRに画像を送信
  const takePhoto = async () => {
    try {
      if (!apiConfigured) {
        Alert.alert('設定エラー', 'APIキーが設定されていません。まずapp.config.jsと.envファイルを設定してください');
        return;
      }

      // カメラ権限をリクエスト
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('権限エラー', 'カメラへのアクセス権限が必要です');
        return;
      }

      // カメラを開き、編集を許可し、base64形式で取得
      const result = await ImagePicker.launchCameraAsync({
        base64: true,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        if (asset.base64) {
          sendToOCR(asset.base64);
        } else {
          Alert.alert('エラー', '画像データを取得できませんでした');
        }
      }
    } catch (error) {
      console.error('撮影エラー:', error);
      Alert.alert('エラー', '撮影時にエラーが発生しました');
    }
  };

  // OCR処理関数 - 画像をGoogle Vision APIに送信して結果を処理
  const sendToOCR = async (base64: string) => {
    // 読み込み状態をtrueに設定し、読み込みインジケーターを表示
    setIsLoading(true);
    try {
      // Expo設定からAPIキーを取得
      const apiKey = Constants.expoConfig?.extra?.apiKey;

      // APIキーの存在をチェック
      if (!apiKey) {
        throw new Error('APIキーが設定されていません');
      }

      // APIリクエストボディを構築 - Google Vision APIが要求する形式
      const body = {
        requests: [
          {
            image: { content: base64 }, // base64エンコードされた画像データ
            features: [{ type: 'TEXT_DETECTION' }], // テキスト検出機能をリクエスト
          },
        ],
      };

      console.log('OCRリクエストを送信中...');
      // Google Vision APIにHTTP POSTリクエストを送信
      const res = await fetch(
        `${API_CONFIG.endpoint}?key=${apiKey}`, // URLにAPIキーを付加
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body), // リクエストボディをシリアライズ
        }
      );

      // 非成功HTTPステータスコードを処理
      if (!res.ok) {
        // エラーデータの解析を試行、失敗した場合は空オブジェクトを使用
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`APIエラー (${res.status}): ${errorData.error?.message || res.statusText}`);
      }

      // APIレスポンスデータを解析
      const data = await res.json();
      // レスポンスから認識されたテキストを抽出
      const text = data.responses?.[0]?.fullTextAnnotation?.text;
      
      // テキスト結果を処理
      if (!text) {
        // テキストが検出されなかった場合、プロンプトメッセージを設定
        setOcrText('テキストが検出されませんでした。他の画像をお試しください。');
        setItems([]);
      } else {
        // テキストの検出に成功した場合、状態を更新
        setOcrText(text);

        const lines = text.split('\n');
        const parsed: { name: string; price: number }[] = [];
        // skipKeywordsを拡張
        const skipKeywords = ['合計', '小計', '税込', '割引', '釣り', '現金', 'ポイント', '点', '数量', '個'];

        for (let i = 0; i < lines.length; i++) {
          const current = lines[i].trim();

          // 1. 優先：商品名＋価格が同一行にある場合
          const inlineMatch = current.match(/^(.+?)\s+¥?\s*(\d{2,5})円?/);
          if (inlineMatch) {
            const name = inlineMatch[1].trim();
            const price = parseInt(inlineMatch[2].replace(/,/g, ''));
            if (name !== '' && price >= 30 && price <= 10000 && !skipKeywords.some(word => name.includes(word))) {
              parsed.push({ name, price });
            }
            continue;
          }

          // 2. 補完：商品名と価格が異なる行にある場合
          if (i + 1 < lines.length) {
            const nameLine = current;
            const priceLine = lines[i + 1].trim();
            const priceMatch = priceLine.match(/^¥?\s*([\d,]+)\s*$/);
            if (
              priceMatch &&
              nameLine !== '' &&
              !skipKeywords.some(word => nameLine.includes(word)) &&
              !/数量|個/.test(nameLine)
            ) {
              const price = parseInt(priceMatch[1].replace(/,/g, ''));
              if (price >= 30 && price <= 10000) {
                parsed.push({ name: nameLine, price });
                i++; // 処理済みの価格行をスキップ
              }
            }
          }
        }

        setItems(parsed);
        console.log('🧾 抽出された商品明細:', parsed);
      }
    } catch (error) {
      // OCR処理プロセス中の任意のエラーをキャッチ
      console.error('OCR処理エラー:', error);
      // インターフェースにエラー情報を表示
      setOcrText(`認識失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
      setItems([]);
      Alert.alert('エラー', `OCR処理時にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      // 成功または失敗に関わらず、最終的に読み込み状態を閉じる
      setIsLoading(false);
    }
  };

  // コンポーネントのUI描画
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* API未設定時に警告と設定ガイドを表示 */}
      {!apiConfigured && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ APIキーが設定されていません。以下の手順で設定してください:
          </Text>
          <Text style={styles.instructionText}>
            1. プロジェクトルートディレクトリにapp.config.jsファイルを作成{'\n'}
            2. プロジェクトルートディレクトリに.envファイルを作成しGOOGLE_VISION_API_KEYを追加{'\n'}
            3. dotenvをインストール: npm install dotenv{'\n'}
            4. アプリを再起動
          </Text>
        </View>
      )}
      
      {/* ボタンエリア、撮影とフォトライブラリ選択を含む */}
      <View style={styles.buttonContainer}>
        <Button
          title="写真を撮る"
          onPress={takePhoto}
          disabled={isLoading || !apiConfigured}
        />
        <View style={{ height: 10 }} />
        <Button
          title="🖼 ギャラリーから選ぶ"
          onPress={pickImage}
          disabled={isLoading || !apiConfigured}
        />
      </View>
      
      {/* 読み込み状態インジケーター */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>画像を処理中...</Text>
        </View>
      )}
      
      {/* 選択された画像を表示 */}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
        />
      )}
      
      {/* OCR認識結果を表示 */}
      {ocrText !== '' && (
        <View style={styles.textContainer}>
          <Text style={styles.resultText}>{ocrText}</Text>
        </View>
      )}

      {items.length > 0 && (
        <View style={styles.textContainer}>
          <Text style={styles.resultText}>商品明細：</Text>
          {items.map((item, index) => (
            <Text key={index} style={styles.resultText}>
              {item.name}：{item.price}円
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// StyleSheetを使用してスタイルを定義 - パフォーマンス向上とスタイル管理の集約
const styles = StyleSheet.create({
  container: {
    padding: 20, // 内側余白
  },
  buttonContainer: {
    marginTop: 40, // 上部外側余白
    alignItems: 'center', // 水平中央揃え
  },
  loadingContainer: {
    marginTop: 20, // 上部外側余白
    alignItems: 'center', // 水平中央揃え
  },
  loadingText: {
    marginTop: 10, // 上部外側余白
  },
  image: {
    width: 300, // 画像幅
    height: 300, // 画像高さ
    marginTop: 20, // 上部外側余白
    alignSelf: 'center', // 自身の中央揃え
  },
  textContainer: {
    marginTop: 20, // 上部外側余白
    padding: 10, // 内側余白
    backgroundColor: '#f9f9f9', // 背景色
    borderRadius: 5, // ボーダー角丸
    // シャドウ効果 - プラットフォーム固有
    elevation: 3, // Androidシャドウ
    shadowColor: "#000", // iOSシャドウ色
    shadowOffset: {
      width: 0, // iOSシャドウXオフセット
      height: 1, // iOSシャドウYオフセット
    },
    shadowOpacity: 0.22, // iOSシャドウ透明度
    shadowRadius: 2.22, // iOSシャドウ半径
  },
  resultText: {
    fontSize: 16, // 文字サイズ
  },
  warningContainer: {
    marginTop: 20, // 上部外側余白
    padding: 15, // 内側余白
    backgroundColor: '#fff3cd', // 警告背景色
    borderColor: '#ffeeba', // ボーダー色
    borderWidth: 1, // ボーダー幅
    borderRadius: 5, // ボーダー角丸
  },
  warningText: {
    fontSize: 16, // 文字サイズ
    color: '#856404', // 文字色
    fontWeight: 'bold', // 文字太さ
    marginBottom: 10, // 下部外側余白
  },
  instructionText: {
    fontSize: 14, // 文字サイズ
    color: '#856404', // 文字色
  }
});