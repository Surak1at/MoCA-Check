import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance'; // ✅ รองรับ refresh token อัตโนมัติ
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchResults = async (pageNumber) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/my-results/?page=${pageNumber}`);
      setResults((prev) => {
        const newData = res.data.results.filter(
          newItem => !prev.some(oldItem => oldItem.pdf_url === newItem.pdf_url)
        );
        return [...prev, ...newData];
      });
      
      setHasMore(res.data.next !== null);
    } catch (err) {
      toast.error('ไม่สามารถดึงข้อมูลได้');
      navigate('/login');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setResults([]);        // 🧹 ล้างผลเดิม
    setPage(1);            // 🔁 กลับไปหน้าแรก
  }, []);                  // ✅ ทำแค่ตอน mount  

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      navigate('/login');
      return;
    }

    fetchResults(page);
    // eslint-disable-next-line
  }, [page]);

  return (
    <motion.div
      className="min-h-screen px-6 md:px-20 py-12 bg-gradient-to-br from-pale to-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/90 rounded-xl p-6 md:p-10 shadow-xl max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-secondary text-center">ผลการประเมินของคุณ</h2>

        {results.length === 0 ? (
          <p className="text-center text-gray-500">ยังไม่มีผลการประเมิน</p>
        ) : (
          <>
            <ul className="space-y-4">
              {results.map((item, index) => (
                <li
                  key={item.id || item.created_at}
                  className="bg-gray-100 p-4 rounded-xl shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      ผลการประเมินครั้งที่ {results.length - index}
                      {index === 0 && (
                        <span className="ml-2 text-green-600 text-sm font-normal">
                          (ล่าสุด)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      📅 {new Date(item.created_at).toLocaleString('th-TH', {
                        dateStyle: 'long',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                  <a
                    href={item.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition"
                  >
                    เปิดดู PDF
                  </a>
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'กำลังโหลด...' : 'แสดงเพิ่มเติม'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MyResults;
