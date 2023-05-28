import { useState } from "react"
import { CommentType, NewCommentValues } from "../CommentBoard"
import { CommentReply } from "../CommentReply"

interface CommentProps {
  comment: CommentType
}

export const Comment = ({ comment }: CommentProps) => {
  const defaultNewCommentReplyState: NewCommentValues = {
    parentCommentId: undefined,
    content: "",
  }
  const [showReplyInput, setShowReplyInput] = useState<boolean>(false)
  const [newCommentReply, setNewCommentReply] = useState<NewCommentValues>(
    defaultNewCommentReplyState
  )

  const toggleShowReplyInput = () => {
    setShowReplyInput(!showReplyInput)
  }

  const onNewCommentReply = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCommentReply({
      ...newCommentReply,
      content: event.target.value,
    })
  }

  const onSubmitReply = (event: React.FormEvent<HTMLFormElement>) => {
    setNewCommentReply({
      ...newCommentReply,
      parentCommentId: comment.comment_id,
    })
    // onComment(newCommentValue)
  }

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
