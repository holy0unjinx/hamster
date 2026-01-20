import { useState, useEffect, useRef } from 'react';
import { useCookies } from 'react-cookie';
import '../styles/dashboard.scss';
import { Editor, EditorState, ContentState, RichUtils } from 'draft-js';
import { convertToHTML, convertFromHTML } from 'draft-convert';
import DOMPurify from 'dompurify';

interface Teacher {
  id: number;
  name: string;
  subjectName: string;
  teachersOffice: number;
  homeroomClass: number | null;
}

interface Assessment {
  id: number;
  grade: number;
  class: number;
  title: string;
  description: string;
  maxScore: number;
  teacherId: number;
  period: number;
  examDate: string;
  teacher: Teacher;
}

interface Target {
  grade: number;
  class: number;
  examDate: string;
  period: number;
}

export default function Dashboard() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    maxScore: 10,
    targets: [
      {
        grade: 1,
        class: 1,
        examDate: new Date().toISOString().split('T')[0],
        period: 1,
      },
    ],
  });
  const [cookies] = useCookies(['access-token']);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);
  const [totalTargets, setTotalTargets] = useState(0);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const fetchAssessments = async () => {
    try {
      const res = await fetch(
        'https://hamster-server.vercel.app/api/v1/assessment',
        {
          headers: { Authorization: `Bearer ${cookies['access-token']}` },
        },
      );
      const data = await res.json();
      setAssessments(data.assessments);
    } catch (err) {
      console.error('수행평가 조회 실패:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const descriptionHTML = convertEditorToHTML();
    try {
      setIsLoading(true);
      setProgress(0);
      setTotalTargets(newAssessment.targets.length);

      // 모든 타겟에 대해 순차적으로 요청 보내기
      for (let i = 0; i < newAssessment.targets.length; i++) {
        const target = newAssessment.targets[i];
        setCurrentTarget(target);
        setCurrentTargetIndex(i);

        const requestData = {
          title: newAssessment.title,
          description: descriptionHTML,
          maxScore: newAssessment.maxScore,
          teacherId: localStorage.getItem('userId'),
          grade: target.grade,
          class: target.class,
          period: target.period,
          examDate: target.examDate,
        };

        console.log('요청 데이터:', requestData);

        const res = await fetch(
          'https://hamster-server.vercel.app/api/v1/assessment',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cookies['access-token']}`,
            },
            body: JSON.stringify(requestData),
            credentials: 'include',
          },
        );

        if (!res.ok)
          throw new Error(
            `타겟 생성 실패: ${target.grade}학년 ${target.class}반 ${target.period}교시`,
          );

        // 진행률 업데이트
        setProgress(((i + 1) / newAssessment.targets.length) * 100);
      }

      await fetchAssessments();
      setNewAssessment({
        title: '',
        description: '',
        maxScore: 10,
        targets: [
          {
            grade: 1,
            class: 1,
            examDate: new Date().toISOString().split('T')[0],
            period: 1,
          },
        ],
      });

      // 로딩 상태 초기화
      setIsLoading(false);
      setProgress(0);
      setCurrentTarget(null);
    } catch (err) {
      console.error('수행평가 생성 오류:', err);
      setIsLoading(false);
    }
  };

  const addTarget = () => {
    setNewAssessment({
      ...newAssessment,
      targets: [
        ...newAssessment.targets,
        {
          grade: 1,
          class: 1,
          examDate: new Date().toISOString().split('T')[0],
          period: 1,
        },
      ],
    });
  };

  const removeTarget = (index: number) => {
    setNewAssessment({
      ...newAssessment,
      targets: newAssessment.targets.filter((_, i) => i !== index),
    });
  };

  const updateTarget = (
    index: number,
    field: keyof Target,
    value: string | number,
  ) => {
    setNewAssessment({
      ...newAssessment,
      targets: newAssessment.targets.map((target, i) =>
        i === index ? { ...target, [field]: value } : target,
      ),
    });
  };

  const handleDelete = async (assessmentId: number) => {
    try {
      await fetch(`https://hamster-server.vercel.app/api/v1/assessment`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${cookies['access-token']}`,
          'Content-Type': 'application/json', // Content-Type 헤더 추가
        },
        body: JSON.stringify({ id: assessmentId }), // body에 JSON 형태로 id 추가
      });
      setAssessments((prev) => prev.filter((a) => a.id !== assessmentId));
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (newAssessment.description) {
      const cleanHTML = DOMPurify.sanitize(newAssessment.description);
      const blocks = convertFromHTML(cleanHTML);
      const state = EditorState.createWithContent(blocks);
      setEditorState(state);
    }
  }, [newAssessment.description]);

  const convertEditorToHTML = () => {
    return DOMPurify.sanitize(convertToHTML(editorState.getCurrentContent()));
  };

  const DescriptionPreview = ({ html }: { html: string }) => {
    const [previewState, setPreviewState] = useState(EditorState.createEmpty());

    useEffect(() => {
      const blocks = convertFromHTML(DOMPurify.sanitize(html));
      setPreviewState(EditorState.createWithContent(blocks));
    }, [html]);

    return <Editor editorState={previewState} onChange={() => {}} readOnly />;
  };
  const Toolbar = ({ editorState, onChange }: any) => {
    const applyStyle = (style: string) => {
      onChange(RichUtils.toggleInlineStyle(editorState, style));
    };

    return (
      <div className='toolbar'>
        <button onClick={() => applyStyle('BOLD')}>B</button>
        <button onClick={() => applyStyle('ITALIC')}>I</button>
        <button onClick={() => applyStyle('UNDERLINE')}>U</button>
        <button onClick={() => applyStyle('HIGHLIGHT')}>🔦</button>
      </div>
    );
  };

  return (
    <div className='dashboard-container'>
      <div className='timetable-section'>
        <h2>시간표</h2>
        <iframe
          src='http://comci.net:4082/st'
          className='comci-iframe'
          title='컴시간 시간표'
        />
      </div>

      <div className='assessment-section'>
        <h2>수행평가 관리</h2>

        <form onSubmit={handleSubmit} className='assessment-form'>
          <input
            placeholder='제목'
            value={newAssessment.title}
            onChange={(e) =>
              setNewAssessment({ ...newAssessment, title: e.target.value })
            }
            required
            className='title-input' // 추가
          />
          <div className='editor-container'>
            <Toolbar editorState={editorState} onChange={setEditorState} />
            <div className='editor'>
              <Editor
                editorState={editorState}
                onChange={setEditorState}
                placeholder='문제 설명을 작성하세요...'
              />
            </div>
          </div>
          <div className='input-group'>
            <label>
              배점:
              <input
                type='number'
                min='1'
                value={newAssessment.maxScore}
                onChange={(e) =>
                  setNewAssessment({
                    ...newAssessment,
                    maxScore: +e.target.value,
                  })
                }
              />
            </label>
          </div>

          <h3>대상</h3>
          {newAssessment.targets.map((target, index) => (
            <div key={index} className='target-group'>
              <select
                value={`${target.grade}-${target.class}`}
                onChange={(e) => {
                  const [grade, classNum] = e.target.value.split('-');

                  setNewAssessment({
                    ...newAssessment,
                    targets: newAssessment.targets.map((target, i) =>
                      i === index
                        ? {
                            ...target,
                            grade: parseInt(grade, 10),
                            class: parseInt(classNum, 10),
                          }
                        : target,
                    ),
                  });
                }}
              >
                {[1, 2, 3].map((grade) => {
                  // 1학년은 7반까지, 2,3학년은 6반까지
                  const maxClass = grade === 1 ? 7 : 6;

                  return Array.from({ length: maxClass }, (_, i) => {
                    const classNum = i + 1;
                    return (
                      <option
                        key={`${grade}-${classNum}`}
                        value={`${grade}-${classNum}`}
                      >
                        {grade}학년 {classNum}반
                      </option>
                    );
                  });
                })}
              </select>

              <input
                type='date'
                value={target.examDate}
                onChange={(e) =>
                  updateTarget(index, 'examDate', e.target.value)
                }
              />

              <select
                value={target.period}
                onChange={(e) => updateTarget(index, 'period', +e.target.value)}
              >
                {[...Array(7)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}교시
                  </option>
                ))}
              </select>

              <button type='button' onClick={() => removeTarget(index)}>
                삭제
              </button>
            </div>
          ))}
          <button type='button' onClick={addTarget}>
            대상 추가
          </button>

          <button type='submit' disabled={isLoading}>
            {isLoading ? '등록 중...' : '등록'}
          </button>

          {/* 로딩 상태 표시 UI */}
          {isLoading && (
            <div className='loading-container'>
              <div className='progress-info'>
                <p>
                  <strong>진행 중:</strong> {currentTargetIndex + 1}/
                  {totalTargets} 대상 처리 중
                </p>
                <p>
                  <strong>현재 대상:</strong> {currentTarget?.grade}학년{' '}
                  {currentTarget?.class}반 {currentTarget?.period}교시 (
                  {new Date(currentTarget?.examDate || '').toLocaleDateString()}
                  )
                </p>
              </div>
              <div className='progress-bar-container'>
                <div
                  className='progress-bar'
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className='progress-percentage'>{Math.round(progress)}%</div>
            </div>
          )}
        </form>

        <div className='assessment-list'>
          {assessments &&
            assessments.map((assessment) => (
              <div key={assessment.id} className='assessment-item'>
                <div className='assessment-header'>
                  <h3>{assessment.title}</h3>
                  <button
                    onClick={() => handleDelete(assessment.id)}
                    className='delete-button'
                  >
                    삭제
                  </button>
                </div>
                <DescriptionPreview html={assessment.description} />
                <div className='assessment-meta'>
                  <span>배점: {assessment.maxScore}점</span>
                  <span>담당 교사: {assessment.teacher?.name || '미정'}</span>
                  {assessment.grade && assessment.class && (
                    <div>
                      <span>
                        대상: {assessment.grade}학년 {assessment.class}반
                      </span>
                      <span>
                        일시:{' '}
                        {new Date(assessment.examDate).toLocaleDateString()}{' '}
                        {assessment.period}교시
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
