function SkinRecordPanel({
  selectedDateLabel,
  diagnosisRecord,
  diagnosisImageUrl,
  onDeleteDiagnosisRecord,
  isDeletingDiagnosisRecord,
}) {
  return (
    <section className="skin_record_panel">
      <div className="skin_record_header">
        <h3>피부 사진 기록</h3>
        {diagnosisRecord && (
          <button
            type="button"
            className="skin_record_delete"
            onClick={onDeleteDiagnosisRecord}
            disabled={isDeletingDiagnosisRecord}
          >
            {isDeletingDiagnosisRecord ? "삭제 중" : "삭제"}
          </button>
        )}
      </div>

      {diagnosisImageUrl ? (
        <>
          <p className="skin_record_notice">
            삭제하면 해당 날짜의 피부 상태 진단 사진과 진단 기록이 함께 사라집니다.
          </p>
          <div className="skin_record_preview">
            <img src={diagnosisImageUrl} alt={`${selectedDateLabel} 피부 상태 진단 사진`} />
          </div>
        </>
      ) : (
        <div className="skin_record_empty">
          선택한 날짜의 피부 상태 진단 사진이 없습니다.
        </div>
      )}
    </section>
  );
}

export default SkinRecordPanel;
