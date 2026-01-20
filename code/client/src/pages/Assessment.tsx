import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUser, FaBook, FaAward } from 'react-icons/fa';
import '../styles/assessment.scss';
import Spinner from '@/components/Spinner';
import { IoChevronForward, IoLogOut } from 'react-icons/io5';
import { Editor, EditorState } from 'draft-js';
import { convertFromHTML } from 'draft-convert';
import 'draft-js/dist/Draft.css';

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

    const fetchAssessment = async () => {
      try {
        const response = await fetch(
          `https://hamster-server.vercel.app/api/v1/assessment?id=${id}`,
        );

        if (!response.ok) throw new Error('서버 응답 오류');

        const data = await response.json();

        if (!data.assessments) {
          throw new Error('수행평가를 찾을 수 없습니다');
        }

        setAssessment(data.assessments);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        console.error('API 호출 오류:', err);
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

  const parseDelta = (deltaStr: string) => {
    try {
      return JSON.parse(deltaStr);
    } catch {
      return deltaStr; // 실패 시 원본 문자열 반환
    }
  };

  // 기존 상태 아래에 추가
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // 설명 데이터 변환 처리
  useEffect(() => {
    if (assessment?.description) {
      const contentState = convertFromHTML(assessment.description);
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    }
  }, [assessment]);

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
          <IoChevronForward /> 홈 으로
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
            <div className='draft-editor-container'>
              <Editor
                editorState={editorState}
                onChange={() => {}} // 읽기 전용이므로 빈 함수 전달
                readOnly={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentDetailPage;
