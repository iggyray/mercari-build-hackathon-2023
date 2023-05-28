import { useState } from "react"
import { Comment } from "../Comment/Comment"

export interface CommentType {
  comment_id: number
  parent_comment_id: number | undefined
  user_id: number
  user_name: string
  item_id: number
  content: string
  created_at: string
}

export type NewCommentValues = {
  parentCommentId: number | undefined
  content: string
}

interface CommentBoardProps {
  onComment: (comment: NewCommentValues) => void
  comments: CommentType[]
}

export const CommentBoard = ({ onComment, comments }: CommentBoardProps) => {
  const defaultNewCommentState: NewCommentValues = {
    parentCommentId: undefined,
    content: "",
  }
  const [newCommentValue, setNewCommentValue] = useState<NewCommentValues>(
    defaultNewCommentState
  )

  const onNewComment = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCommentValue({
      parentCommentId: undefined,
      content: event.target.value,
    })
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
              return <Comment key={comment.comment_id} comment={comment} />
            })}
          </div>
        )}
        <div className="CommentInput">
          <form onSubmit={onSubmitComment}>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Add a comment"
              onChange={onNewComment}
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
