import { useState } from "react"
import { Comment } from "../Comment/Comment"

export interface CommentType {
  comment_id: number
  user_id: number
  item_id: number
  content: string
  created_at: string
}

interface CommentBoardProps {
  onComment: (comment: string) => void
  comments: CommentType[]
}

export const CommentBoard = ({ onComment, comments }: CommentBoardProps) => {
  const [newCommentValue, setNewCommentValue] = useState<string>("")

  const onNewCommentValueChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewCommentValue(event.target.value)
  }

  const onSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    onComment(newCommentValue)
  }

  return (
    <div>
      <h4>Comments</h4>
      <div className="CommentBoardWrapper">
        {comments && (
          <div className="CommentBoard flex-column">
            {comments.map((comment) => {
              return <Comment comment={comment} />
            })}
          </div>
        )}
        <div className="CommentInput">
          <form onSubmit={onSubmitComment}>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Add a comment"
              onChange={onNewCommentValueChange}
              required
            ></textarea>
            <button type="submit" id="MerButton">
              Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
