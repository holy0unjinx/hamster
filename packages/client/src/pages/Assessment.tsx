import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUser, FaBook, FaAward } from 'react-icons/fa';
import '../styles/assessment.scss';
import Spinner from '@/components/Spinner';
import { IoChevronForward, IoLogOut } from 'react-icons/io5';

// 수행평가 타입 정의
interface Assessment {
  id: number;
  title: string;
  description: string;
  maxScore: number;
  period: number;
  examDate: string;
  teacherName: string;
  subjectName: string;
}

const AssessmentDetailPage: React.FC = () => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // React Router 사용
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('수행평가 ID가 없습니다.');
      return;
    }

    const fetchAssessment = () => {
      try {
        // localStorage에서 assessment 데이터 가져오기
        const assessmentsString = localStorage.getItem('assessment');

        if (!assessmentsString) {
          setError('저장된 수행평가 정보가 없습니다.');
          return;
        }

        const assessments: Assessment[] = JSON.parse(assessmentsString);
        const foundAssessment = assessments.find(
          (item) => item.id === Number(id),
        );

        if (!foundAssessment) {
          setError(`ID ${id}에 해당하는 수행평가를 찾을 수 없습니다.`);
        } else {
          setAssessment(foundAssessment);
        }
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleGoHome = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  if (loading) return <Spinner isLoading={loading} />;
  if (error)
    return (
      <div className='assessment-container'>
        <p className='error-text'>{error}</p>
        <header>
          <Link to='/'>
            <IoChevronForward /> 홈으로
          </Link>
        </header>
      </div>
    );

  return (
    <div className='assessment-container'>
      <header>
        <Link to='/'>
          <IoChevronForward /> 홈으로
        </Link>
      </header>

      {assessment && (
        <div className='assessment-card'>
          <h1 className='assessment-title'>{assessment.title}</h1>

          <div className='subject-info'>
            <span className='subject-name'>
              <FaBook className='info-icon' /> {assessment.subjectName}
            </span>
            <span className='teacher-name'>
              <FaUser className='info-icon' /> {assessment.teacherName} 선생님
            </span>
          </div>

          <div className='info-grid'>
            <div className='info-item'>
              <span className='info-label'>
                <FaAward className='info-icon' /> 배점
              </span>
              <span className='info-value'>{assessment.maxScore}점</span>
            </div>
            <div className='info-item'>
              <span className='info-label'>시험 기간</span>
              <span className='info-value'>{assessment.period}교시</span>
            </div>
            <div className='info-item'>
              <span className='info-label'>
                <FaCalendarAlt className='info-icon' /> 시험 날짜
              </span>
              <span className='info-value'>
                {formatDate(assessment.examDate)}
              </span>
            </div>
          </div>

          <div className='description-section'>
            <h3 className='description-label'>문제 설명</h3>
            <p className='description-content'>{assessment.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentDetailPage;
