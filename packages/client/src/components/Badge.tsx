import '../styles/badge.scss';

interface BadgeProps {
  content: string;
  background?: string | undefined;
  size?: string;
}

function Badge({
  content,
  background = '0, 0, 0, 0.25',
  size = '0.75rem',
}: BadgeProps) {
  const style = {
    // 배경색 처리
    backgroundColor:
      background !== 'none'
        ? `rgba(${background})` // RGB 값 전달 시 투명도 0.25 적용
        : undefined,
    // 배경 없을 때 패딩
    paddingLeft: background === 'none' ? '0.3rem' : undefined,
    fontSize: size,
  };

  return (
    <div className='badge' style={style}>
      {content}
    </div>
  );
}

export default Badge;
