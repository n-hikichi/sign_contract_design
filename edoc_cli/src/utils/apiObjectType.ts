namespace apiObjectType {

    export type DeleteObject = { document_id: string, reason: string };
    export type ApproveObject = { email: string };
    export type RemandObject = { email: string, comment: string };
    export type RemandObject_debug = { responderId: string, types: string, comment: string };
    export type ReissueApprovalUrlObject = { recipient_id: string, comment: string };
}
export default apiObjectType;
