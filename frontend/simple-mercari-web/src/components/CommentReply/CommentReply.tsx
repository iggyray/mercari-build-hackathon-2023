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
          <span>{reply.created_at}</span>
        </div>
      </div>
    </div>
  )
}
