function AnalysisButtons({ onNavigate }) {
  return (
    <div className="button-container">
      <button type="button" className="analysis_button" onClick={() => onNavigate("/analysis")}>
        <span className="analysis_ring" aria-hidden="true" />
        <span className="analysis_label">피부 타입 분석하러 가기</span>
      </button>
      <button type="button" className="analysis_button" onClick={() => onNavigate("/analysis1")}>
        <span className="analysis_ring" aria-hidden="true" />
        <span className="analysis_label">
          피부 상태 분석하러 가기
          <span className="analysis_sub">사진 한 장으로 지금 상태 확인하기</span>
        </span>
      </button>
    </div>
  );
}

export default AnalysisButtons;