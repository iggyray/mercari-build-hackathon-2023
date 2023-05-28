import { CommentType } from "../CommentBoard"

interface CommentReplyProps {
  reply: CommentType
}

export const CommentReply = ({ reply }: CommentReplyProps) => {
  return (
    <div className="CommentReplyWrapper">
      <h6>
        <b>{reply.user_name}</b>
      </h6>
      <div className="CommentReplyBubble">
        <p>{reply.content}</p>
        <div className="CommentReplyFooter">
          <p>{reply.created_at}</p>
        </div>
      </div>
    </div>
  )
}
