/**
 * ==========================================
 *  LiveCameraPanel Component
 *  تم استخراجه تلقائياً من App.jsx
 * ==========================================
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck, BarChart3, Bell, BookOpen, CheckCircle, Building2, Camera,
  ClipboardCheck, ClipboardList, Copy, Database, ExternalLink, Download,
  Gift, FileClock, GraduationCap, Layers3, LayoutDashboard, LineChart,
  Maximize2, Plus, QrCode, RefreshCw, Rocket, Wifi, WifiOff, Clock3,
  Save, ScanLine, School, ShoppingCart, Search, Settings, Shield,
  ShieldAlert, ShieldCheck, Trash2, Trophy, Upload, UserCircle2, Users,
  Wand2, Pencil, Archive, ArrowRightLeft, MonitorSmartphone, Loader2,
  PackageCheck, Printer, Unlink2, UserCheck, Phone, RefreshCcw, School2,
  Sparkles, FolderOpen, Info, ChevronDown, AlertCircle
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Legend,
  Line, LineChart as RLineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts';
// === الدوال المشتركة ===
import { canAccessPermission, captureDataUrlFromVideo, clamp, cx, exportToExcel, formatDateTime, generateQrDataUrl, getAuthActionMeta, getRoleLabel, getShortStudentName, getStudentCompanyName, getStudentGroupingLabel, getTodayIso, getUnifiedSchoolStudents, parseTimeToMinutes, pieColors, resultTone, roles, safeNumber, schoolHasStructureClassrooms, statusFromResult, toArabicDate, detectBarcodeValueFromSource} from '../utils/sharedFunctions.jsx';
import { Select } from './ui/FormElements';


import { Badge } from './ui/FormElements';
function LiveCameraPanel({ mode = "face", title, description, onCapture, onDetectBarcode, onDetectFace, onResolveBarcodeLabel, externalMessage, variant = "default", autoStart = false, autoRestart = false, hideDeviceSelect = false, videoHeightClass = "h-56" }) {
  const videoRef = useRef(null);
  const canvasOverlayRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const readyTimerRef = useRef(null);
  const successTimerRef = useRef(null);
  const hasAutoStartedRef = useRef(false);
  const autoRestartRef = useRef(autoRestart);
  const startCameraRef = useRef(null);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devices, setDevices] = useState([]);
  const devicesRef = useRef([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const selectedDeviceIdRef = useRef("");
  const [cameraReady, setCameraReady] = useState(false);
  const [showGreenFrame, setShowGreenFrame] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false); // أيقونة صح كبيرة في وسط الكاميرا
  const [flashCount, setFlashCount] = useState(0); // عداد الوميض
  // detectionHint: { type: 'face'|'barcode', box: {x,y,w,h}|null } | null
  const [detectionHint, setDetectionHint] = useState(null);
  const detectionHintTimerRef = useRef(null);
  // تبديل الكاميرا الأمامية/الخلفية
  const [facingMode, setFacingMode] = useState('environment'); // الخلفية افتراضياً لجميع الأوضاع
  const facingModeRef = useRef('environment');
  const [hasBothCameras, setHasBothCameras] = useState(false);
  const [devicesLoaded, setDevicesLoaded] = useState(false);

  // رسم إطار الكشف على canvas overlay
  const drawDetectionBox = useCallback((type, box) => {
    const canvas = canvasOverlayRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const vw = video.videoWidth || video.clientWidth;
    const vh = video.videoHeight || video.clientHeight;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, cw, ch);
    if (!box) return;
    // تحويل إحداثيات الفيديو إلى إحداثيات canvas
    const scaleX = cw / (vw || cw);
    const scaleY = ch / (vh || ch);
    const x = box.x * scaleX;
    const y = box.y * scaleY;
    const w = box.width * scaleX;
    const h = box.height * scaleY;
    const color = type === 'face' ? '#10b981' : '#3b82f6';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    // رسم زوايا الإطار بدلاً من مستطيل كامل (أجمل بصرياً)
    const corner = Math.min(w, h) * 0.22;
    ctx.beginPath();
    // زاوية علوية يسرى
    ctx.moveTo(x + corner, y); ctx.lineTo(x, y); ctx.lineTo(x, y + corner);
    // زاوية علوية يمنى
    ctx.moveTo(x + w - corner, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + corner);
    // زاوية سفلية يسرى
    ctx.moveTo(x, y + h - corner); ctx.lineTo(x, y + h); ctx.lineTo(x + corner, y + h);
    // زاوية سفلية يمنى
    ctx.moveTo(x + w - corner, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - corner);
    ctx.stroke();
    // نقطة مركزية
    ctx.fillStyle = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, 4, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const clearDetectionBox = useCallback(() => {
    const canvas = canvasOverlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDetectionHint(null);
  }, []);

  const showDetectionHint = useCallback((type, box) => {
    setDetectionHint({ type, box });
    drawDetectionBox(type, box);
    if (detectionHintTimerRef.current) window.clearTimeout(detectionHintTimerRef.current);
    detectionHintTimerRef.current = window.setTimeout(() => {
      clearDetectionBox();
    }, 1200);
  }, [drawDetectionBox, clearDetectionBox]);

  const clearReadyWatcher = useCallback(() => {
    if (readyTimerRef.current) {
      window.clearInterval(readyTimerRef.current);
      readyTimerRef.current = null;
    }
  }, []);

  const flashSuccessFrame = useCallback((label = "تمت القراءة بنجاح") => {
    setCameraReady(true);
    setMessage(label);
    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    // صوت beep بسيط عبر Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch { /* ignore */ }
    // أيقونة صح كبيرة تظهر فوراً
    setShowSuccessOverlay(true);
    setFlashCount(0);
    // وميض الإطار الأخضر: يومض 3 مرات
    let count = 0;
    const flash = () => {
      setShowGreenFrame(prev => !prev);
      count++;
      if (count < 6) {
        successTimerRef.current = window.setTimeout(flash, 200);
      } else {
        // بعد الوميض: يبقى أخضر لثانية ثم يختفي
        setShowGreenFrame(true);
        successTimerRef.current = window.setTimeout(() => {
          setShowGreenFrame(false);
          setShowSuccessOverlay(false);
          successTimerRef.current = null;
        }, 900);
      }
    };
    setShowGreenFrame(true);
    successTimerRef.current = window.setTimeout(flash, 200);
  }, []);

  const stopCamera = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    clearReadyWatcher();
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setShowSuccessOverlay(false);
    setShowGreenFrame(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause?.();
      videoRef.current.srcObject = null;
    }
    setActive(false);
    setCameraReady(false);
    setShowGreenFrame(false);
  }, [clearReadyWatcher]);

  const loadDevices = useCallback(async () => {
    if (!(navigator.mediaDevices?.enumerateDevices)) {
      setDevicesLoaded(true);
      return;
    }
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const cameras = list.filter((item) => item.kind === "videoinput");
      setDevices(cameras);
      devicesRef.current = cameras;
      if (!selectedDeviceIdRef.current && cameras[0]?.deviceId) {
        setSelectedDeviceId(cameras[0].deviceId);
        selectedDeviceIdRef.current = cameras[0].deviceId;
      }
    // اكتشاف ما إذا كان الجهاز يحتوي على كاميرتين (أمامية وخلفية)
    const hasEnv = cameras.some(c => c.label?.toLowerCase().includes('back') || c.label?.toLowerCase().includes('rear') || c.label?.toLowerCase().includes('خلف'));
    const hasUser = cameras.some(c => c.label?.toLowerCase().includes('front') || c.label?.toLowerCase().includes('face') || c.label?.toLowerCase().includes('أمام'));
    setHasBothCameras(cameras.length >= 2 || (hasEnv && hasUser));
    } catch {
      // ignore
    } finally {
      setDevicesLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDevices();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyStreamToVideo = useCallback(async (stream) => {
    const video = videoRef.current;
    if (!video) return false;
    if (!stream || !stream.active) return false;
    // Set required attributes for cross-browser autoplay
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    // Assign stream directly - do NOT call video.load() as it cancels the stream
    video.srcObject = stream;
    // Wait for metadata or canplay (whichever fires first)
    await new Promise((resolve) => {
      let done = false;
      const finalize = () => {
        if (done) return;
        done = true;
        video.onloadedmetadata = null;
        video.oncanplay = null;
        resolve(true);
      };
      video.onloadedmetadata = finalize;
      video.oncanplay = finalize;
      // Fallback timeout in case neither event fires
      window.setTimeout(finalize, 1500);
    });
    try {
      const playPromise = video.play();
      if (playPromise !== undefined) await playPromise;
    } catch (err) {
      if (err && err.name === 'NotAllowedError') {
        // Autoplay blocked - user must tap the video or the start button
        setError('اضغط على زر تشغيل الكاميرا لبدء البث.');
      }
      // Other errors (AbortError) are safe to ignore
    }
    // Retry play after a short delay for browsers that need a nudge
    window.setTimeout(() => {
      if (videoRef.current && videoRef.current.paused && videoRef.current.srcObject) {
        videoRef.current.play().catch(() => {});
      }
    }, 500);
    return Boolean(video.videoWidth || video.readyState >= 2);
  }, []);

  const startCamera = useCallback(async () => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      setError("الكاميرا غير متاحة في هذا المتصفح أو الجهاز.");
      return;
    }
    stopCamera();
    setError("");
    setCameraReady(false);
    setShowGreenFrame(false);
    setMessage(mode === "barcode" ? "وجّه QR الطالب نحو الكاميرا وستجري القراءة مباشرة دون الحاجة إلى تصوير." : mode === "mixed" ? "وجّه QR أو الوجه داخل الإطار وسيتم التعرف تلقائيًا." : "وجّه الوجه داخل الإطار وستجري المطابقة المباشرة تلقائيًا.");
    const preferredFacing = facingModeRef.current;
    const attempts = [];
    const currentDeviceId = selectedDeviceIdRef.current || selectedDeviceId;
    if (currentDeviceId) attempts.push({ video: { deviceId: { exact: currentDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    // محاولة باستخدام facingMode المحدد
    attempts.push({ video: { facingMode: { exact: preferredFacing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    attempts.push({ video: { facingMode: { ideal: preferredFacing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    attempts.push({ video: true, audio: false });

    let stream = null;
    for (const constraints of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch {
        // try next fallback
      }
    }
    if (!stream) {
      setError("تعذر تشغيل الكاميرا. تأكد من منح الصلاحية للمتصفح أو جرّب متصفح Chrome/Edge.");
      return;
    }
    streamRef.current = stream;
    const firstTrack = stream.getVideoTracks?.()[0];
    const currentLabel = firstTrack?.label || "";
    const currentDevices = devicesRef.current.length ? devicesRef.current : devices;
    if (currentLabel && currentDevices.length) {
      const matching = currentDevices.find((item) => item.label === currentLabel);
      if (matching?.deviceId) {
        setSelectedDeviceId(matching.deviceId);
        selectedDeviceIdRef.current = matching.deviceId;
      }
    }
    // Set active FIRST so the <video> element is rendered in DOM before we assign srcObject
    setActive(true);
    // Wait one frame for React to render the video element
    await new Promise((resolve) => window.requestAnimationFrame(() => window.setTimeout(resolve, 50)));
    await applyStreamToVideo(stream);
    clearReadyWatcher();
    readyTimerRef.current = window.setInterval(() => {
      const video = videoRef.current;
      if (video?.videoWidth && video?.videoHeight) {
        setCameraReady(true);
        clearReadyWatcher();
      }
    }, 200);
    // بعد 2.5 ثانية نعتبر الكاميرا جاهزة حتى لو لم يُكتشف videoWidth (بعض الأجهزة)
    window.setTimeout(() => {
      if (streamRef.current) {
        setCameraReady(true);
        clearReadyWatcher();
      }
    }, 2500);
    window.setTimeout(() => {
      const video = videoRef.current;
      if (streamRef.current && !(video?.videoWidth && video?.videoHeight)) {
        // Try one more play() before showing error (iOS may need extra nudge)
        video?.play?.().catch(() => {});
        window.setTimeout(() => {
          if (streamRef.current && !(videoRef.current?.videoWidth && videoRef.current?.videoHeight)) {
            // لا نعرض خطأ بعد الآن لأننا اعتبرناها جاهزة بعد 2.5ث
          }
        }, 1500);
      }
    }, 4000);
    loadDevices();
  }, [applyStreamToVideo, clearReadyWatcher, loadDevices, mode, stopCamera]);

  // تحديث refs عند تغيير props
  useEffect(() => { autoRestartRef.current = autoRestart; }, [autoRestart]);
  useEffect(() => { startCameraRef.current = startCamera; }, [startCamera]);
  // تحديث facingModeRef عند تغيير facingMode
  useEffect(() => { facingModeRef.current = facingMode; }, [facingMode]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  useEffect(() => () => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!(active && ["barcode", "mixed"].includes(mode) && onDetectBarcode && videoRef.current)) return undefined;
    let cancelled = false;
    let processing = false;
    // كشف الحركة: نحفظ بصمة الإطار الأخير بعد المسح ونقارنها
    let lastFrameHash = null;
    let waitingForChange = false;

    // حساب بصمة بسيطة للإطار (16x16 grayscale)
    const getFrameHash = () => {
      if (!videoRef.current) return null;
      try {
        const cv = document.createElement('canvas');
        cv.width = 16; cv.height = 16;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        cx.drawImage(videoRef.current, 0, 0, 16, 16);
        const d = cx.getImageData(0, 0, 16, 16).data;
        let sum = 0;
        const vals = [];
        for (let i = 0; i < d.length; i += 4) {
          const g = Math.round(d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114);
          vals.push(g); sum += g;
        }
        return vals;
      } catch { return null; }
    };

    // مقارنة إطارين: يُرجع نسبة التغيير (0-1)
    const frameChangedEnough = (h1, h2, threshold = 18) => {
      if (!h1 || !h2 || h1.length !== h2.length) return true;
      let diff = 0;
      for (let i = 0; i < h1.length; i++) diff += Math.abs(h1[i] - h2[i]);
      return (diff / h1.length) > threshold;
    };

    const tick = async () => {
      if (cancelled || !videoRef.current || processing) return;
      if (!(videoRef.current.videoWidth && videoRef.current.videoHeight)) {
        timerRef.current = window.setTimeout(tick, 500);
        return;
      }

      // إذا كنا ننتظر تغيير المشهد، نتحقق من الحركة أولاً
      if (waitingForChange) {
        const currentHash = getFrameHash();
        if (!frameChangedEnough(lastFrameHash, currentHash, 18)) {
          // لم يتغير المشهد - ننتظر أكثر
          timerRef.current = window.setTimeout(tick, 400);
          return;
        }
        // تغيّر المشهد - نستأنف القراءة
        waitingForChange = false;
        lastFrameHash = null;
      }

      processing = true;
      try {
        // محاولة كشف موضع الباركود أولاً لإظهار مؤشر بصري
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'code_39', 'code_128'] });
            const codes = await barcodeDetector.detect(videoRef.current);
            if (codes && codes.length > 0) {
              const code = codes[0];
              const box = code.boundingBox;
              if (box) showDetectionHint('barcode', box);
            }
          } catch {
            // ignore
          }
        }
        const value = await detectBarcodeValueFromSource(videoRef.current);
        if (value) {
          const barcodeLabel = onResolveBarcodeLabel ? (onResolveBarcodeLabel(value) || value) : value;
          flashSuccessFrame(`تمت قراءة QR: ${barcodeLabel}`);
          window.setTimeout(() => onDetectBarcode(value), 220);
          if (autoRestartRef.current) {
            // نحفظ بصمة الإطار الحالي وننتظر تغيير المشهد
            lastFrameHash = getFrameHash();
            waitingForChange = true;
            processing = false;
            timerRef.current = window.setTimeout(tick, 800);
          } else {
            window.setTimeout(() => stopCamera(), 1900);
          }
          return;
        }
      } catch {
        // ignore
      } finally {
        processing = false;
      }
      timerRef.current = window.setTimeout(tick, 350);
    };
    timerRef.current = window.setTimeout(tick, 500);
    return () => {
      cancelled = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, flashSuccessFrame, mode, onDetectBarcode, showDetectionHint, stopCamera]);

  useEffect(() => {
    if (!(active && ["face", "mixed"].includes(mode) && onDetectFace && videoRef.current)) return undefined;
    let cancelled = false;
    let processing = false;
    let lastFrameHash = null;
    let waitingForChange = false;

    const getFrameHash = () => {
      if (!videoRef.current) return null;
      try {
        const cv = document.createElement('canvas');
        cv.width = 16; cv.height = 16;
        const cx = cv.getContext('2d', { willReadFrequently: true });
        cx.drawImage(videoRef.current, 0, 0, 16, 16);
        const d = cx.getImageData(0, 0, 16, 16).data;
        const vals = [];
        for (let i = 0; i < d.length; i += 4) {
          vals.push(Math.round(d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114));
        }
        return vals;
      } catch { return null; }
    };

    const frameChangedEnough = (h1, h2, threshold = 18) => {
      if (!h1 || !h2 || h1.length !== h2.length) return true;
      let diff = 0;
      for (let i = 0; i < h1.length; i++) diff += Math.abs(h1[i] - h2[i]);
      return (diff / h1.length) > threshold;
    };

    const tick = async () => {
      if (cancelled || !videoRef.current || processing) return;
      if (!(videoRef.current.videoWidth && videoRef.current.videoHeight)) {
        timerRef.current = window.setTimeout(tick, 700);
        return;
      }

      // إذا كنا ننتظر تغيير المشهد، نتحقق من الحركة أولاً
      if (waitingForChange) {
        const currentHash = getFrameHash();
        if (!frameChangedEnough(lastFrameHash, currentHash, 18)) {
          timerRef.current = window.setTimeout(tick, 400);
          return;
        }
        waitingForChange = false;
        lastFrameHash = null;
      }

      processing = true;
      try {
        const video = videoRef.current;
        let faceBox = null;
        let faceDetected = false;

        if (typeof window !== 'undefined' && 'FaceDetector' in window) {
          try {
            const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
            const faces = await detector.detect(video);
            if (faces && faces.length > 0) {
              faceDetected = true;
              faceBox = faces[0].boundingBox;
            }
          } catch {
            faceDetected = true;
          }
        } else {
          faceDetected = true;
        }

        if (!faceDetected) {
          timerRef.current = window.setTimeout(tick, 600);
          return;
        }

        if (faceBox) showDetectionHint('face', faceBox);

        const dataUrl = captureDataUrlFromVideo(video, 0.88);
        if (dataUrl) {
          const result = await onDetectFace(dataUrl);
          if (result) {
            const name = typeof result === "object" ? result.name : "الطالب";
            const isEnroll = typeof result === "object" && result.enrolled;
            const msg = isEnroll
              ? `تم حفظ بصمة الوجه${name ? ` لـ: ${name}` : ""}`
              : `تمت المطابقة للوجه${name ? `: ${name}` : ""}`;
            flashSuccessFrame(msg);
            if (autoRestartRef.current) {
              // نحفظ بصمة الإطار وننتظر تغيير المشهد
              lastFrameHash = getFrameHash();
              waitingForChange = true;
              processing = false;
              timerRef.current = window.setTimeout(tick, 800);
            } else {
              window.setTimeout(() => stopCamera(), 1900);
            }
            return;
          }
        }
      } catch {
        // ignore
      } finally {
        processing = false;
      }
      timerRef.current = window.setTimeout(tick, mode === "mixed" ? 1200 : 900);
    };

    timerRef.current = window.setTimeout(tick, 800);
    return () => {
      cancelled = true;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, flashSuccessFrame, mode, onDetectFace, showDetectionHint, stopCamera]);

  useEffect(() => {
    // ننتظر حتى تنتهي loadDevices أولاً حتى تكون startCamera محدثة بالأجهزة الصحيحة
    if (!autoStart || !devicesLoaded || hasAutoStartedRef.current) return undefined;
    hasAutoStartedRef.current = true;
    const id = window.setTimeout(() => {
      if (!streamRef.current) startCameraRef.current?.();
    }, 200);
    return () => window.clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, devicesLoaded]);

  const captureFrame = async () => {
    if (!videoRef.current || !active) return;
    const video = videoRef.current;
    if (!(video.videoWidth && video.videoHeight)) {
      setMessage("الكاميرا لم تكن جاهزة بعد، جرّب مرة أخرى.");
      return;
    }
    const dataUrl = captureDataUrlFromVideo(video, 0.92);
    if (!dataUrl) return;

    if (mode === "barcode") {
      const value = await detectBarcodeValueFromSource(dataUrl);
      if (value) {
        const barcodeLabel2 = onResolveBarcodeLabel ? (onResolveBarcodeLabel(value) || value) : value;
        flashSuccessFrame(`تم التعرف على QR: ${barcodeLabel2}`);
        onDetectBarcode?.(value);
      } else {
        setMessage("لم يتم التعرف على QR من هذه اللقطة. حاول تقريب البطاقة أو تحسين الإضاءة.");
      }
    }

    if (onCapture) {
      setBusy(true);
      try {
        await onCapture(dataUrl);
        if (mode === "face") flashSuccessFrame("تم التقاط الصورة الاحتياطية وإرسالها للمعالجة.");
      } finally {
        setBusy(false);
      }
    }
  };

  return (
    <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold text-slate-800">{title}</div>
          {description ? <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div> : null}
        </div>
        <Badge tone={active ? (cameraReady ? "green" : "amber") : "slate"}>{active ? (cameraReady ? "الكاميرا جاهزة" : "جارٍ التهيئة") : "الكاميرا متوقفة"}</Badge>
      </div>
      {!hideDeviceSelect && devices.length > 1 ? (
        <div className="mt-4">
          <Select label="مصدر الكاميرا" value={selectedDeviceId} onChange={(e) => { setSelectedDeviceId(e.target.value); selectedDeviceIdRef.current = e.target.value; }}>
            {devices.map((device, index) => (
              <option key={device.deviceId || index} value={device.deviceId}>{device.label || `كاميرا ${index + 1}`}</option>
            ))}
          </Select>
        </div>
      ) : null}
      {/* زر تبديل الكاميرا الأمامية/الخلفية - يظهر على الجوال/الآيباد دائماً أو عند وجود كاميرتين */}
      {(hasBothCameras || devices.length >= 2 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) ? (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => {
              const newFacing = facingMode === 'user' ? 'environment' : 'user';
              // تحديث الـ ref فوراً قبل استدعاء startCamera لمنع stale closure
              facingModeRef.current = newFacing;
              setFacingMode(newFacing);
              setSelectedDeviceId('');
              selectedDeviceIdRef.current = '';
              if (active) {
                stopCamera();
                window.setTimeout(() => startCameraRef.current?.(), 300);
              }
            }}
            className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 active:scale-95 transition-all"
            title="تبديل بين الكاميرا الأمامية والخلفية"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7h-3a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="13" r="3"/>
              <path d="M9 2h6"/>
            </svg>
            {facingMode === 'user' ? 'تحويل للكاميرا الخلفية' : 'تحويل للكاميرا الأمامية'}
          </button>
          <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
            {facingMode === 'user' ? 'أمامية 🤳' : 'خلفية 📷'}
          </span>
        </div>
      ) : null}
      <div className={cx("relative mt-4 overflow-hidden rounded-2xl bg-slate-900", variant === "gate" ? "border border-white/10 shadow-2xl" : "") }>
        {active ? <video ref={videoRef} className={cx(videoHeightClass, "w-full object-cover")} muted playsInline autoPlay onCanPlay={() => { if (videoRef.current?.videoWidth && videoRef.current?.videoHeight) { setCameraReady(true); clearReadyWatcher(); } }} /> : <div className={cx("flex items-center justify-center px-5 text-center text-sm text-white/80", videoHeightClass)}>افتح الكاميرا من هنا لالتقاط الوجه أو قراءة QR مباشرة من اللابتوب أو الآيباد أو الجوال.</div>}
        {/* Canvas overlay لرسم إطار الكشف حول الوجه أو الباركود */}
        {active ? <canvas ref={canvasOverlayRef} className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 10 }} /> : null}
        {/* أيقونة صح كبيرة تظهر عند نجاح القراءة */}
        {showSuccessOverlay ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ zIndex: 30, background: 'rgba(0,0,0,0.35)' }}>
            <div className="flex flex-col items-center gap-3" style={{ animation: 'successPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 shadow-2xl" style={{ boxShadow: '0 0 0 8px rgba(16,185,129,0.3), 0 0 60px rgba(16,185,129,0.6)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="rounded-full bg-emerald-500 px-6 py-2 text-base font-black text-white shadow-xl">
                تمت القراءة بنجاح
              </div>
            </div>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 20 }}>
          <div className={cx("absolute inset-4 rounded-[28px] border-4 transition-all duration-200", showGreenFrame ? "border-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.18),0_0_35px_rgba(16,185,129,0.35)]" : cameraReady ? "border-white/70" : "border-amber-300/80 animate-pulse")} />
          <div className="absolute inset-x-0 top-4 flex justify-center">
            <div className={cx("rounded-full px-4 py-2 text-xs font-black shadow-lg transition-all duration-200", showGreenFrame ? "bg-emerald-500 text-white" : detectionHint?.type === 'face' ? "bg-emerald-700/90 text-white" : detectionHint?.type === 'barcode' ? "bg-blue-600/90 text-white" : cameraReady ? "bg-slate-900/70 text-white" : "bg-amber-400 text-slate-900")}>{showGreenFrame ? "تمت القراءة" : detectionHint?.type === 'face' ? "وجه مكتشف - جارٍ المطابقة..." : detectionHint?.type === 'barcode' ? "باركود مكتشف - جارٍ القراءة..." : cameraReady ? (mode === "barcode" ? "وجّه QR داخل الإطار" : mode === "face" ? "وجّه الوجه داخل الإطار" : "وجّه QR أو الوجه داخل الإطار") : "جارٍ تهيئة الكاميرا"}</div>
          </div>
          {!cameraReady && active ? <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35"><div className="rounded-3xl bg-slate-950/75 px-5 py-4 text-center text-sm font-bold text-white ring-1 ring-white/10">إذا بقيت الشاشة سوداء فبدّل مصدر الكاميرا أو اضغط إعادة التشغيل.</div></div> : null}
        </div>
      </div>
      {(externalMessage || message) ? <div className={cx("mt-3 rounded-2xl px-4 py-3 text-sm ring-1", showGreenFrame ? "bg-emerald-50 text-emerald-700 ring-emerald-100" : "bg-slate-50 text-slate-600 ring-slate-200")}>{externalMessage || message}</div> : null}
      {error ? <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 ring-1 ring-rose-100">{error}</div> : null}
      <div className={cx("mt-4 flex flex-wrap gap-3", variant === "gate" ? "justify-center" : "") }>
        {!active ? <button onClick={startCamera} className="rounded-2xl bg-sky-700 px-4 py-3 text-sm font-bold text-white">تشغيل الكاميرا</button> : <button onClick={stopCamera} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">إيقاف الكاميرا</button>}
        <button onClick={captureFrame} disabled={!active || busy} className={cx("rounded-2xl px-4 py-3 text-sm font-bold", !active || busy ? "bg-slate-200 text-slate-500" : "bg-emerald-600 text-white")}>{busy ? "جارٍ المعالجة..." : "التقاط احتياطي"}</button>
        <button onClick={() => { stopCamera(); window.setTimeout(() => startCamera(), 300); }} className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200">إعادة تشغيل</button>
      </div>
      {mode === "barcode" ? <div className="mt-3 text-xs leading-6 text-slate-500">القراءة المباشرة تعمل تلقائيًا ما دامت الكاميرا مفعلة، وعند النجاح سيظهر إطار أخضر واضح يعطي إحساس القراءة الناجحة.</div> : mode === "mixed" ? <div className="mt-3 text-xs leading-6 text-slate-500">الكاميرا الواحدة تقرأ QR أو الوجه تلقائيًا، وعند النجاح سيظهر إطار أخضر داخل المشهد. عند عدم التعرّف جرّب إعادة التشغيل أو الالتقاط الاحتياطي.</div> : <div className="mt-3 text-xs leading-6 text-slate-500">إذا ظهرت شاشة سوداء على بعض الأجهزة، بدّل مصدر الكاميرا أو استخدم إعادة التشغيل؛ تمت إضافة إطار تهيئة واضح حتى تعرف متى أصبحت الكاميرا جاهزة فعليًا.</div>}
    </div>
  );
}

export default LiveCameraPanel;
