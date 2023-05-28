import { CommentType } from "../CommentBoard"

interface CommentProps {
  comment: CommentType
}

export const Comment = ({ comment }: CommentProps) => {
  return (
    <div className="CommentWrapper">
      <h6>
        <b>User: {comment.user_id}</b>
      </h6>
      <div className="CommentBubble">
        <p>{comment.content}</p>
        <div className="CommentFooter">
          <p>{comment.created_at}</p>
        </div>
      </div>
    </div>
  )
}
