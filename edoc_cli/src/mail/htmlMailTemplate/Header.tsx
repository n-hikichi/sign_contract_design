import React from "react";

type ApprovalEmailTemplateProps = {
  senderName: string;
  receiverName: string;
  documentName: string;
  expiredDate: string;
  approvalUrl: string;
};

const ApprovalEmailTemplate: React.FC<ApprovalEmailTemplateProps> = ({
  senderName,
  receiverName,
  documentName,
  expiredDate,
  approvalUrl
}) => (
  <div style={{ display: "flex", flexDirection: "column", width: "100%", paddingTop: "5px", paddingBottom: "5px" }}>
    <div style={{
      backgroundColor: "#eeeeee",
      margin: "0 auto",
      minHeight: "500px",
      justifyContent: "center",
      padding: "20px",
      width: "600px",
      border: "5px solid #0D47A1",
      boxSizing: "border-box"
    }}>
      <div style={{
        backgroundColor: "white",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "20px",
        paddingRight: "20px",
        marginBottom: "20px",
        boxSizing: "border-box"
      }}>
        <div style={{ width: "100%", marginTop: "40px", marginBottom: "60px" }}>
          <div style={{
            backgroundColor: "#0D47A1",
            padding: "8px",
            borderRadius: "4px",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "1.5em"
          }}>
            ブロックチェーン電子契約
          </div>
        </div>
        <div style={{ fontWeight: "bold", fontSize: "1.5em" }}>
          {senderName}様から承認依頼が届きました。
        </div>
        <div style={{ fontWeight: "bold", fontSize: "1.2em", marginBottom: "30px", color: "#0D47A1" }}>
          {documentName}
        </div>
        <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "5px" }}>
          <a href={approvalUrl} target="_blank" rel="noopener noreferrer" style={{
            margin: "10px",
            borderRadius: "20px",
            padding: "12px 24px",
            backgroundColor: "#1976d2",
            color: "white",
            textDecoration: "none",
            fontSize: "16px"
          }}>
            書類を確認する
          </a>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          閲覧期限：{expiredDate}
        </div>
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          borderTop: "3px solid lightgrey",
          boxSizing: "border-box"
        }}>
          <div style={{ paddingTop: "30px", paddingBottom: "5px" }}>
            本書は、以下の関係者間による契約書です。
          </div>
          <div style={{ paddingBottom: "30px", paddingLeft: "8px" }}>
            ・{senderName}<br />
            ・{receiverName}
          </div>
          <div style={{ paddingBottom: "30px" }}>
            上記の「書類を確認する」をクリックしていただき、契約書の確認をお願いします。
          </div>
        </div>
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          borderTop: "3px solid lightgrey",
          boxSizing: "border-box"
        }}>
          <div style={{ paddingBottom: "30px", marginTop: "30px" }}>
            最終版の契約書は、本書のすべての関係者による承認がなされたらダウンロード可能になります。
          </div>
        </div>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", marginBottom: "60px" }}>
        <div style={{ paddingBottom: "10px" }}>
          本メールは送信専用です。ご返答いただいてもお答えする事は出来ません。
        </div>
        <div>
          リンクの閲覧期限が切れている場合は本書の担当者へご連絡ください。
        </div>
      </div>
      <div style={{
        fontSize: "0.7em",
        paddingTop: "2px",
        paddingBottom: "2px",
        textAlign: "right",
        width: "100%"
      }}>
        Copyright © 2025, MICROS SOFTWARE, Inc. All Rights Reserved.
      </div>
    </div>
  </div>
);

export default ApprovalEmailTemplate;
