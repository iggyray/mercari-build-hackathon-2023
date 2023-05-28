import { useEffect, useState } from "react"
import { CommentType, NewCommentValues } from "../CommentBoard"
import { CommentReply } from "../CommentReply"

interface CommentProps {
  comment: CommentType
  onCommentReply: (commentReply: NewCommentValues) => void
}

export const Comment = ({ comment, onCommentReply }: CommentProps) => {
  const [showReplyInput, setShowReplyInput] = useState<boolean>(false)
  const [newCommentReply, setNewCommentReply] = useState<string>("")

  const toggleShowReplyInput = () => {
    setShowReplyInput(!showReplyInput)
  }

  const onNewCommentReply = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCommentReply(event.target.value)
  }

  const onSubmitReply = (event: React.FormEvent<HTMLFormElement>) => {
    const commentReply: NewCommentValues = {
      parentCommentId: comment.comment_id,
      content: newCommentReply,
    }
    onCommentReply(commentReply)
  }

  useEffect(() => {}, [comment])

  return (
    <div className="CommentWrapper">
      <h6>
        <b>{comment.user_name}</b>
      </h6>
      <div className="CommentBubble">
        <p>{comment.content}</p>
        <div className="CommentFooter">
          <span className="ReplyButton" onClick={toggleShowReplyInput}>
            reply
          </span>
          <span>{comment.created_at}</span>
        </div>
        {showReplyInput && (
          <div className="CommentInput CommentReplyInput">
            <form onSubmit={onSubmitReply}>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Reply to a comment"
                onChange={onNewCommentReply}
                required
              ></textarea>
              <button type="submit" id="MerButton">
                Comment
              </button>
            </form>
          </div>
        )}
      </div>
      <CommentReply reply={comment} />
    </div>
  )
}
