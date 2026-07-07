import "./Footer.css";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site_footer">
      <div className="site_footer_inner">
        <div className="site_footer_top">
          <p className="site_footer_logo">Triple Skin</p>
          <ul className="site_footer_links">
            <li>회사소개</li>
            <li>이용약관</li>
            <li>개인정보처리방침</li>
            <li>고객센터</li>
          </ul>
        </div>

        <div className="site_footer_info">
          <p>(주)트리플스킨 | 대표 : 박성준 | 사업자등록번호 : 010-4461-1591</p>
          <p>주소 : 부산광역시 감만동 부경대학교  | 이메일 : support@tripleskin.example</p>
        </div>

        <p className="site_footer_copyright">
          &copy; {year} Triple Skin. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;