/*
 * Local Waifu Live - Unity WebSocket Client
 * 
 * This script connects to the Python WebSocket server running in WSL
 * and controls a 3D anime character based on animation commands.
 * 
 * SETUP:
 * 1. Install NativeWebSocket: https://github.com/endel/NativeWebSocket
 *    - Window > Package Manager > + > Add package from git URL
 *    - Enter: https://github.com/endel/NativeWebSocket.git#upm
 * 
 * 2. Attach this script to your Waifu character GameObject
 * 
 * 3. Assign references in Inspector:
 *    - Animator: Your character's Animator component
 *    - Skinned Mesh Renderer: For blendshapes (facial expressions)
 *    - Chat UI Text: TextMeshProUGUI for displaying chat
 *    - Input Field: TMP_InputField for user input
 * 
 * 4. Set up Animator with these trigger parameters:
 *    - idle_soft, lean_forward, sway_hips, teasing_pose
 *    - close_intimate_pose, slow_breathing, shy_cover
 * 
 * 5. Set up blendshapes on your character mesh:
 *    - smile_seductive, blush_light, blush_heavy
 *    - half_lidded_eyes, soft_moan, look_away
 */

using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using NativeWebSocket;

namespace LocalWaifuLive
{
    [Serializable]
    public class AnimationCommand
    {
        public string type;
        public string body;
        public string face;
        public float intensity;
        public float duration;
    }

    [Serializable]
    public class ServerMessage
    {
        public AnimationCommand animation;
        public string chat;
    }

    [Serializable]
    public class ClientMessage
    {
        public string message;
    }

    public class WebSocketClient : MonoBehaviour
    {
        [Header("Connection Settings")]
        [SerializeField] private string serverUrl = "ws://localhost:8765";
        [SerializeField] private float reconnectDelay = 3f;
        [SerializeField] private bool autoReconnect = true;

        [Header("Character References")]
        [SerializeField] private Animator animator;
        [SerializeField] private SkinnedMeshRenderer faceMesh;

        [Header("UI References")]
        [SerializeField] private TextMeshProUGUI chatText;
        [SerializeField] private TMP_InputField inputField;
        [SerializeField] private Button sendButton;
        [SerializeField] private TextMeshProUGUI connectionStatus;

        [Header("Animation Settings")]
        [SerializeField] private float blendShapeTransitionSpeed = 5f;
        [SerializeField] private float animationCrossFade = 0.25f;

        [Header("Debug")]
        [SerializeField] private bool debugMode = true;

        private WebSocket websocket;
        private bool isConnecting = false;
        private Dictionary<string, int> blendShapeIndices = new Dictionary<string, int>();
        private Dictionary<string, float> targetBlendShapes = new Dictionary<string, float>();
        private Coroutine currentAnimationCoroutine;

        // Blendshape mappings (adjust indices based on your model)
        private readonly Dictionary<string, string[]> expressionBlendShapes = new Dictionary<string, string[]>
        {
            { "smile_seductive", new[] { "Mouth_Smile", "Eyes_Happy" } },
            { "blush_light", new[] { "Cheek_Blush" } },
            { "blush_heavy", new[] { "Cheek_Blush", "Face_Embarrassed" } },
            { "half_lidded_eyes", new[] { "Eyes_HalfClosed", "Eyes_Bedroom" } },
            { "soft_moan", new[] { "Mouth_Open", "Eyes_Pleasure" } },
            { "look_away", new[] { "Eyes_LookAway", "Head_TurnAway" } }
        };

        private void Awake()
        {
            // Cache blendshape indices
            if (faceMesh != null)
            {
                CacheBlendShapeIndices();
            }
        }

        private void Start()
        {
            // Setup UI
            if (sendButton != null)
            {
                sendButton.onClick.AddListener(OnSendClicked);
            }

            if (inputField != null)
            {
                inputField.onSubmit.AddListener(OnInputSubmit);
            }

            // Initial connection
            ConnectToServer();
        }

        private void Update()
        {
#if !UNITY_WEBGL || UNITY_EDITOR
            if (websocket != null)
            {
                websocket.DispatchMessageQueue();
            }
#endif

            // Smoothly interpolate blendshapes
            UpdateBlendShapes();
        }

        private void OnDestroy()
        {
            DisconnectFromServer();
        }

        private void OnApplicationQuit()
        {
            DisconnectFromServer();
        }

        #region Connection Management

        private async void ConnectToServer()
        {
            if (isConnecting) return;
            isConnecting = true;

            UpdateConnectionStatus("Connecting...", Color.yellow);
            Log($"Connecting to {serverUrl}...");

            try
            {
                websocket = new WebSocket(serverUrl);

                websocket.OnOpen += OnWebSocketOpen;
                websocket.OnMessage += OnWebSocketMessage;
                websocket.OnError += OnWebSocketError;
                websocket.OnClose += OnWebSocketClose;

                await websocket.Connect();
            }
            catch (Exception e)
            {
                Log($"Connection failed: {e.Message}");
                UpdateConnectionStatus("Connection Failed", Color.red);
                isConnecting = false;

                if (autoReconnect)
                {
                    StartCoroutine(ReconnectAfterDelay());
                }
            }
        }

        private async void DisconnectFromServer()
        {
            if (websocket != null && websocket.State == WebSocketState.Open)
            {
                await websocket.Close();
            }
        }

        private IEnumerator ReconnectAfterDelay()
        {
            Log($"Reconnecting in {reconnectDelay} seconds...");
            UpdateConnectionStatus($"Reconnecting in {reconnectDelay}s...", Color.yellow);
            yield return new WaitForSeconds(reconnectDelay);
            ConnectToServer();
        }

        private void OnWebSocketOpen()
        {
            Log("Connected to server!");
            UpdateConnectionStatus("Connected", Color.green);
            isConnecting = false;
        }

        private void OnWebSocketMessage(byte[] bytes)
        {
            string message = System.Text.Encoding.UTF8.GetString(bytes);
            Log($"Received: {message}");

            try
            {
                ServerMessage serverMessage = JsonUtility.FromJson<ServerMessage>(message);
                
                // Process on main thread
                UnityMainThreadDispatcher.Instance.Enqueue(() =>
                {
                    ProcessServerMessage(serverMessage);
                });
            }
            catch (Exception e)
            {
                Log($"Failed to parse message: {e.Message}");
            }
        }

        private void OnWebSocketError(string error)
        {
            Log($"WebSocket error: {error}");
            UpdateConnectionStatus("Error", Color.red);
        }

        private void OnWebSocketClose(WebSocketCloseCode closeCode)
        {
            Log($"Connection closed: {closeCode}");
            UpdateConnectionStatus("Disconnected", Color.red);
            isConnecting = false;

            if (autoReconnect)
            {
                StartCoroutine(ReconnectAfterDelay());
            }
        }

        #endregion

        #region Message Handling

        private void ProcessServerMessage(ServerMessage message)
        {
            // Update chat text
            if (!string.IsNullOrEmpty(message.chat) && chatText != null)
            {
                chatText.text = message.chat;
            }

            // Process animation command
            if (message.animation != null)
            {
                ProcessAnimationCommand(message.animation);
            }
        }

        private void ProcessAnimationCommand(AnimationCommand cmd)
        {
            Log($"Animation: body={cmd.body}, face={cmd.face}, intensity={cmd.intensity}, duration={cmd.duration}");

            // Trigger body animation
            if (!string.IsNullOrEmpty(cmd.body) && animator != null)
            {
                PlayBodyAnimation(cmd.body, cmd.intensity);
            }

            // Set facial expression
            if (!string.IsNullOrEmpty(cmd.face))
            {
                SetFacialExpression(cmd.face, cmd.intensity, cmd.duration);
            }
        }

        private void PlayBodyAnimation(string animationName, float intensity)
        {
            if (animator == null) return;

            // Set intensity parameter if it exists
            if (HasParameter(animator, "Intensity"))
            {
                animator.SetFloat("Intensity", intensity);
            }

            // Try to play as trigger
            if (HasParameter(animator, animationName))
            {
                animator.SetTrigger(animationName);
            }
            // Or crossfade to animation state
            else if (HasState(animator, animationName))
            {
                animator.CrossFade(animationName, animationCrossFade);
            }
            else
            {
                Log($"Animation '{animationName}' not found in Animator");
            }
        }

        private void SetFacialExpression(string expression, float intensity, float duration)
        {
            // Stop any existing expression transition
            if (currentAnimationCoroutine != null)
            {
                StopCoroutine(currentAnimationCoroutine);
            }

            // Reset all target blendshapes
            foreach (var key in new List<string>(targetBlendShapes.Keys))
            {
                targetBlendShapes[key] = 0f;
            }

            // Set target blendshapes for this expression
            if (expressionBlendShapes.TryGetValue(expression, out string[] blendShapeNames))
            {
                foreach (string shapeName in blendShapeNames)
                {
                    targetBlendShapes[shapeName] = intensity * 100f; // Blendshapes are 0-100
                }
            }

            // Start expression coroutine
            currentAnimationCoroutine = StartCoroutine(ExpressionCoroutine(expression, intensity, duration));
        }

        private IEnumerator ExpressionCoroutine(string expression, float intensity, float duration)
        {
            yield return new WaitForSeconds(duration);

            // Gradually return to neutral (unless a new expression is triggered)
            foreach (var key in new List<string>(targetBlendShapes.Keys))
            {
                targetBlendShapes[key] = 0f;
            }
        }

        #endregion

        #region Input Handling

        private void OnSendClicked()
        {
            SendMessage();
        }

        private void OnInputSubmit(string text)
        {
            SendMessage();
        }

        private async void SendMessage()
        {
            if (inputField == null || string.IsNullOrWhiteSpace(inputField.text))
                return;

            if (websocket == null || websocket.State != WebSocketState.Open)
            {
                Log("Not connected to server");
                return;
            }

            string userMessage = inputField.text.Trim();
            inputField.text = "";

            ClientMessage msg = new ClientMessage { message = userMessage };
            string json = JsonUtility.ToJson(msg);

            Log($"Sending: {json}");

            try
            {
                await websocket.SendText(json);
            }
            catch (Exception e)
            {
                Log($"Failed to send message: {e.Message}");
            }

            // Refocus input field
            inputField.ActivateInputField();
        }

        #endregion

        #region Blendshape Management

        private void CacheBlendShapeIndices()
        {
            if (faceMesh == null || faceMesh.sharedMesh == null) return;

            Mesh mesh = faceMesh.sharedMesh;
            for (int i = 0; i < mesh.blendShapeCount; i++)
            {
                string name = mesh.GetBlendShapeName(i);
                blendShapeIndices[name] = i;
                targetBlendShapes[name] = 0f;
            }

            Log($"Cached {blendShapeIndices.Count} blendshapes");
        }

        private void UpdateBlendShapes()
        {
            if (faceMesh == null) return;

            foreach (var kvp in targetBlendShapes)
            {
                if (blendShapeIndices.TryGetValue(kvp.Key, out int index))
                {
                    float current = faceMesh.GetBlendShapeWeight(index);
                    float target = kvp.Value;
                    float newValue = Mathf.Lerp(current, target, Time.deltaTime * blendShapeTransitionSpeed);
                    faceMesh.SetBlendShapeWeight(index, newValue);
                }
            }
        }

        #endregion

        #region Utility Methods

        private bool HasParameter(Animator anim, string paramName)
        {
            foreach (AnimatorControllerParameter param in anim.parameters)
            {
                if (param.name == paramName) return true;
            }
            return false;
        }

        private bool HasState(Animator anim, string stateName)
        {
            // Check all layers for the state
            for (int i = 0; i < anim.layerCount; i++)
            {
                if (anim.HasState(i, Animator.StringToHash(stateName)))
                {
                    return true;
                }
            }
            return false;
        }

        private void UpdateConnectionStatus(string status, Color color)
        {
            if (connectionStatus != null)
            {
                connectionStatus.text = status;
                connectionStatus.color = color;
            }
        }

        private void Log(string message)
        {
            if (debugMode)
            {
                Debug.Log($"[WaifuClient] {message}");
            }
        }

        #endregion
    }

    /// <summary>
    /// Helper class to dispatch actions to the main Unity thread.
    /// Attach this to a GameObject in your scene.
    /// </summary>
    public class UnityMainThreadDispatcher : MonoBehaviour
    {
        private static UnityMainThreadDispatcher _instance;
        private readonly Queue<Action> _executionQueue = new Queue<Action>();

        public static UnityMainThreadDispatcher Instance
        {
            get
            {
                if (_instance == null)
                {
                    var go = new GameObject("MainThreadDispatcher");
                    _instance = go.AddComponent<UnityMainThreadDispatcher>();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        public void Enqueue(Action action)
        {
            lock (_executionQueue)
            {
                _executionQueue.Enqueue(action);
            }
        }

        private void Update()
        {
            lock (_executionQueue)
            {
                while (_executionQueue.Count > 0)
                {
                    _executionQueue.Dequeue().Invoke();
                }
            }
        }
    }
}
