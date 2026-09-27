import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../lib/supabase';

const SCANNER_ID = 'tech-titans-qr-reader';

export default function EventAttendanceScanner() {
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isScanningRef = useRef(false);
  const processingRef = useRef(false);

  const [scannerReady, setScannerReady] = useState(false);
  const [cameraRunning, setCameraRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState({
    type: '',
    message: '',
  });

  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode(SCANNER_ID);
    setScannerReady(true);

    return () => {
      const scanner = scannerRef.current;

      if (scanner && isScanningRef.current) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              scanner.clear();
            } catch {
              // Scanner already cleared.
            }
          });
      } else if (scanner) {
        try {
          scanner.clear();
        } catch {
          // Scanner already cleared.
        }
      }

      isScanningRef.current = false;
      processingRef.current = false;
    };
  }, []);

  const clearResult = () => {
    setAttendance(null);

    setStatus({
      type: '',
      message: '',
    });
  };

  const handleAttendance = async (decodedText) => {
    if (processingRef.current) {
      return;
    }

    processingRef.current = true;
    setLoading(true);

    setStatus({
      type: 'info',
      message: 'QR code detected. Verifying attendance...',
    });

    try {
      let qrData;

      try {
        qrData = JSON.parse(decodedText);
      } catch {
        throw new Error(
          'This is not a valid Tech Titans event QR code.'
        );
      }

      if (qrData?.type !== 'TECH_TITANS_EVENT_PASS') {
        throw new Error(
          'This QR code is not a valid Tech Titans event pass.'
        );
      }

      if (!qrData?.qr_token) {
        throw new Error(
          'QR code does not contain a valid attendance token.'
        );
      }

      const { data, error } = await supabase.rpc(
        'mark_event_attendance',
        {
          p_qr_token: qrData.qr_token,
        }
      );

      if (error) {
        throw new Error(
          error.message || 'Unable to mark attendance.'
        );
      }

      if (!data) {
        throw new Error(
          'No attendance response was received.'
        );
      }

      setAttendance(data);

      /*
       * -------------------------------------------------------
       * ALREADY ATTENDED
       * -------------------------------------------------------
       */

      if (data.already_attended) {
        setStatus({
          type: 'warning',
          message:
            'Attendance was already marked. No additional XP was awarded.',
        });
      }

      /*
       * -------------------------------------------------------
       * FIRST SUCCESSFUL SCAN + XP
       * -------------------------------------------------------
       */

      else if (data.success && data.xp_awarded) {
        setStatus({
          type: 'success',
          message: `Attendance marked successfully! +${data.xp_amount} XP awarded.`,
        });
      }

      /*
       * -------------------------------------------------------
       * SUCCESS BUT NO XP
       * -------------------------------------------------------
       */

      else if (data.success) {
        setStatus({
          type: 'success',
          message: 'Attendance marked successfully!',
        });
      }

      /*
       * -------------------------------------------------------
       * OTHER RESULT
       * -------------------------------------------------------
       */

      else {
        setStatus({
          type: 'warning',
          message:
            data.message ||
            'Attendance could not be marked.',
        });
      }
    } catch (error) {
      console.error('Attendance error:', error);

      setAttendance(null);

      setStatus({
        type: 'error',
        message:
          error?.message ||
          'Something went wrong while processing the QR code.',
      });
    } finally {
      setLoading(false);
      processingRef.current = false;
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;

    if (!scanner || !isScanningRef.current) {
      setCameraRunning(false);
      return;
    }

    try {
      await scanner.stop();
    } catch (error) {
      console.warn(
        'Could not stop scanner:',
        error
      );
    }

    isScanningRef.current = false;
    setCameraRunning(false);
  };

  const startCamera = async () => {
    clearResult();

    if (!scannerReady || !scannerRef.current) {
      setStatus({
        type: 'error',
        message:
          'QR scanner is still loading. Please try again.',
      });

      return;
    }

    const scanner = scannerRef.current;

    if (isScanningRef.current) {
      return;
    }

    try {
      setStatus({
        type: 'info',
        message: 'Starting camera...',
      });

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
          aspectRatio: 1,
        },
        async (decodedText) => {
          if (
            loading ||
            processingRef.current
          ) {
            return;
          }

          await stopCamera();
          await handleAttendance(decodedText);
        },
        () => {
          // Normal scanning errors are ignored.
        }
      );

      isScanningRef.current = true;
      setCameraRunning(true);

      setStatus({
        type: 'info',
        message:
          'Camera is ready. Point it at the event QR code.',
      });
    } catch (error) {
      console.error(
        'Camera error:',
        error
      );

      isScanningRef.current = false;
      setCameraRunning(false);

      setStatus({
        type: 'error',
        message:
          'Unable to start the camera. Please allow camera permission or use Scan from Gallery.',
      });
    }
  };

  const handleGalleryClick = () => {
    clearResult();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleGalleryFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    clearResult();

    if (!scannerReady || !scannerRef.current) {
      setStatus({
        type: 'error',
        message:
          'QR scanner is still loading. Please try again.',
      });

      return;
    }

    try {
      setLoading(true);

      setStatus({
        type: 'info',
        message:
          'Reading QR code from the selected image...',
      });

      if (isScanningRef.current) {
        await stopCamera();
      }

      const scanner = scannerRef.current;

      const decodedText =
        await scanner.scanFile(
          file,
          true
        );

      await handleAttendance(decodedText);
    } catch (error) {
      console.error(
        'Gallery QR error:',
        error
      );

      setStatus({
        type: 'error',
        message:
          'Could not find a valid QR code in this image. Please select a clear screenshot/photo of the event QR code.',
      });

      setAttendance(null);
      setLoading(false);
      processingRef.current = false;
    }
  };

  const scanNext = () => {
    clearResult();
    startCamera();
  };

  return (
    <section className="mt-10">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-xl">

        {/* HEADER */}

        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-wider text-white">
            EVENT ATTENDANCE SCANNER
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Scan a student's Tech Titans event QR pass
            using the camera or select a QR image from
            the gallery/file explorer.
          </p>
        </div>

        {/* HIDDEN FILE INPUT */}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryFile}
          className="hidden"
        />

        {/* QR SCANNER */}

        <div
          id={SCANNER_ID}
          className="mx-auto min-h-[280px] w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-black/40"
        />

        {/* BUTTONS */}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">

          {!cameraRunning ? (
            <button
              type="button"
              onClick={startCamera}
              disabled={loading}
              className="flex-1 rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              📷 START CAMERA
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              disabled={loading}
              className="flex-1 rounded-lg border border-red-500/40 bg-red-500/10 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ⏹ STOP CAMERA
            </button>
          )}

          <button
            type="button"
            onClick={handleGalleryClick}
            disabled={loading}
            className="flex-1 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🖼️ SCAN FROM GALLERY
          </button>
        </div>

        {/* STATUS */}

        {status.message && (
          <div
            className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border-green-500/30 bg-green-500/10 text-green-300'
                : status.type === 'error'
                  ? 'border-red-500/30 bg-red-500/10 text-red-300'
                  : status.type === 'warning'
                    ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
                    : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
            }`}
          >
            {status.message}
          </div>
        )}

        {/* ATTENDANCE RESULT */}

        {attendance && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">

            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {attendance.already_attended
                  ? '⚠️ ALREADY ATTENDED'
                  : attendance.success
                    ? '✅ ATTENDANCE CONFIRMED'
                    : 'ATTENDANCE RESULT'}
              </h3>
            </div>

            {/* XP REWARD */}

            {attendance.success &&
              attendance.xp_awarded && (
                <div className="mb-5 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-center">

                  <div className="text-3xl">
                    ⭐
                  </div>

                  <div className="mt-1 text-xl font-black text-yellow-300">
                    +{attendance.xp_amount} XP
                  </div>

                  <div className="mt-1 text-xs uppercase tracking-wider text-yellow-200/70">
                    Attendance reward
                  </div>

                </div>
              )}

            {/* ALREADY ATTENDED NOTICE */}

            {attendance.already_attended && (
              <div className="mb-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-center">

                <div className="text-2xl">
                  🛡️
                </div>

                <p className="mt-2 text-sm font-semibold text-yellow-300">
                  XP was not awarded again.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  This registration has already received
                  its attendance reward.
                </p>

              </div>
            )}

            {/* STUDENT / EVENT DETAILS */}

            <div className="space-y-3 text-sm">

              {attendance.student_name && (
                <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span className="text-gray-400">
                    Student
                  </span>

                  <span className="text-right font-semibold text-white">
                    {attendance.student_name}
                  </span>
                </div>
              )}

              {attendance.student_username && (
                <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span className="text-gray-400">
                    Username
                  </span>

                  <span className="text-right text-white">
                    @{attendance.student_username}
                  </span>
                </div>
              )}

              {attendance.student_email && (
                <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span className="text-gray-400">
                    Email
                  </span>

                  <span className="break-all text-right text-white">
                    {attendance.student_email}
                  </span>
                </div>
              )}

              {attendance.event_title && (
                <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span className="text-gray-400">
                    Event
                  </span>

                  <span className="text-right font-semibold text-white">
                    {attendance.event_title}
                  </span>
                </div>
              )}

              {attendance.registration_code && (
                <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span className="text-gray-400">
                    Registration
                  </span>

                  <span className="font-mono font-semibold text-cyan-300">
                    {attendance.registration_code}
                  </span>
                </div>
              )}

              {attendance.venue && (
                <div className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span className="text-gray-400">
                    Venue
                  </span>

                  <span className="text-right text-white">
                    {attendance.venue}
                  </span>
                </div>
              )}

              {attendance.attended_at && (
                <div className="flex justify-between gap-4">
                  <span className="text-gray-400">
                    Attendance Time
                  </span>

                  <span className="text-right text-white">
                    {new Date(
                      attendance.attended_at
                    ).toLocaleString()}
                  </span>
                </div>
              )}

              {/* TOTAL XP */}

              {typeof attendance.total_xp ===
                'number' && (
                <div className="mt-4 flex justify-between gap-4 rounded-lg border border-yellow-400/10 bg-yellow-400/5 px-4 py-3">

                  <span className="font-semibold text-gray-300">
                    Total XP
                  </span>

                  <span className="font-black text-yellow-300">
                    ⭐ {attendance.total_xp} XP
                  </span>

                </div>
              )}

            </div>

            {/* SCAN NEXT */}

            <button
              type="button"
              onClick={scanNext}
              className="mt-6 w-full rounded-lg bg-white px-5 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              🔄 SCAN NEXT STUDENT
            </button>

          </div>
        )}

        {/* INFORMATION */}

        <div className="mt-5 rounded-lg border border-white/5 bg-white/[0.03] p-4">

          <p className="text-xs leading-5 text-gray-500">

            <span className="font-semibold text-gray-400">
              ATTENDANCE XP:
            </span>{' '}
            Every student's first successful attendance
            scan awards <strong>50 XP</strong>.

            <br />

            <span className="font-semibold text-gray-400">
              DUPLICATE PROTECTION:
            </span>{' '}
            Scanning the same event QR again will not
            award XP a second time.

            <br />

            

          </p>

        </div>

      </div>
    </section>
  );
}