'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FilesetResolver,
  HandLandmarker,
} from '@mediapipe/tasks-vision';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gesture, setGesture] =
    useState('未辨識');
  const questions = [
    '數字 1',
    '數字 2',
    '數字 3',
    '數字 4',
    '數字 5',
  ];

  const [question, setQuestion] =
    useState(questions[0]);
  const [answerResult, setAnswerResult] =
    useState('');

  useEffect(() => {

    if (gesture === '未辨識') return;

    if (gesture === question) {

      setAnswerResult('✅ 答對');

      setTimeout(() => {

        let nextQuestion = question;

        while (nextQuestion === question) {

          nextQuestion =
            questions[
            Math.floor(
              Math.random() *
              questions.length
            )
            ];

        }

        setQuestion(nextQuestion);

        setAnswerResult('');

      }, 1000);

    } else {

      setAnswerResult('❌ 再試一次');

    }

  }, [gesture]);

  useEffect(() => {
    document.title = '陳立育 製作測試';
  }, []);

  const openCamera = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14"
      );

      const handLandmarker =
        await HandLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          }
        );

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onloadeddata = () => {
          detectHands();
        };
      }

      function detectHands() {
        if (
          !videoRef.current ||
          !canvasRef.current
        ) {
          requestAnimationFrame(detectHands);
          return;
        }

        const results =
          handLandmarker.detectForVideo(
            videoRef.current,
            performance.now()
          );

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          requestAnimationFrame(detectHands);
          return;
        }

        canvas.width =
          videoRef.current.videoWidth;

        canvas.height =
          videoRef.current.videoHeight;

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const connections = [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 4],

          [0, 5],
          [5, 6],
          [6, 7],
          [7, 8],

          [5, 9],
          [9, 10],
          [10, 11],
          [11, 12],

          [9, 13],
          [13, 14],
          [14, 15],
          [15, 16],

          [13, 17],
          [17, 18],
          [18, 19],
          [19, 20],

          [0, 17],
        ];

        results.landmarks.forEach(
          (hand) => {

            const indexUp =
              hand[8].y < hand[6].y;

            const middleUp =
              hand[12].y < hand[10].y;

            const ringUp =
              hand[16].y < hand[14].y;

            const pinkyUp =
              hand[20].y < hand[18].y;

            const thumbOpen =
              Math.abs(hand[4].x - hand[3].x) > 0.03;

            let result = '未辨識';

            if (
              thumbOpen &&
              !indexUp &&
              !middleUp &&
              !ringUp &&
              !pinkyUp
            ) {
              result = '數字 5';

            } else if (
              indexUp &&
              !middleUp &&
              !ringUp &&
              !pinkyUp
            ) {
              result = '數字 1';
            } else if (
              indexUp &&
              middleUp &&
              !ringUp &&
              !pinkyUp
            ) {
              result = '數字 2';
            } else if (
              indexUp &&
              middleUp &&
              ringUp &&
              !pinkyUp
            ) {
              result = '數字 3';
            } else if (
              indexUp &&
              middleUp &&
              ringUp &&
              pinkyUp
            ) {
              result = '數字 4';
            }

            setGesture(result);
            console.log(
              'thumb',
              thumbOpen,
              'index',
              indexUp,
              'middle',
              middleUp,
              'ring',
              ringUp,
              'pinky',
              pinkyUp,
              '=>',
              result
            );
            /*
        
            setAnswerResult('✅ 答對');
        
            setAnswered(true);
        
            setTimeout(() => {
        
              const nextQuestion =
                questions[
                  Math.floor(
                    Math.random() *
                    questions.length
                  )
                ];
        
           setTimeout(() => {
        
          const nextQuestion =
            questions[
              Math.floor(
                Math.random() *
                questions.length
              )
            ];
        
          console.log('準備換題');
        
          setQuestion(nextQuestion);
        
          console.log(
            '新題目=',
            nextQuestion
          );
        
          setAnswerResult('');
          setAnswered(false);
        
        }, 1000);
        
              setAnswerResult('');
        
              setAnswered(false);
        
            }, 1000);
        
          } else {
        
            setAnswerResult('❌ 再試一次');
        
          }
        
        }
        */
            // 骨架
            ctx.strokeStyle = '#00AAFF';
            ctx.lineWidth = 3;

            connections.forEach(
              ([start, end]) => {
                const p1 = hand[start];
                const p2 = hand[end];

                ctx.beginPath();

                ctx.moveTo(
                  p1.x * canvas.width,
                  p1.y * canvas.height
                );

                ctx.lineTo(
                  p2.x * canvas.width,
                  p2.y * canvas.height
                );

                ctx.stroke();
              }
            );

            // 21個關節點
            hand.forEach(
              (point, index) => {
                const x =
                  point.x * canvas.width;

                const y =
                  point.y * canvas.height;

                ctx.beginPath();

                ctx.arc(
                  x,
                  y,
                  5,
                  0,
                  Math.PI * 2
                );

                ctx.fillStyle =
                  '#00FF00';

                ctx.fill();

                // 顯示編號
                ctx.fillStyle =
                  '#FFFFFF';

                ctx.font =
                  '12px Arial';

                ctx.fillText(
                  index.toString(),
                  x + 8,
                  y - 8
                );
              }
            );
          }
        );

        requestAnimationFrame(
          detectHands
        );
      }

    } catch (error) {
      console.error(error);

      alert(
        'MediaPipe 載入失敗\n\n' +
        String(error)
      );
    }
  }; //

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-100">

      <h2 className="text-lg text-gray-700">
        陳立育 製作測試
      </h2>

      <h1 className="text-6xl font-bold text-black">
        台灣手語 AI 測驗系統
      </h1>

      <p className="text-xl text-gray-700">
        MediaPipe 手部追蹤測試
      </p>
      <h2 className="text-4xl font-bold text-blue-700">
        題目：請比 {question}
      </h2>

      <h2 className="text-5xl font-bold text-red-600">
        {gesture}
      </h2>

      <h2 className="text-3xl font-bold">
        {answerResult}
      </h2>

      <button
        onClick={openCamera}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg"
      >
        開始測驗
      </button>

      <div className="relative">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-[640px] rounded-xl border bg-black"
        />

        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-[640px] h-full pointer-events-none"
        />

      </div>

    </main>
  );
}