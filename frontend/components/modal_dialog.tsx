import styles_r_w from "../styles/chatroom_window.module.css";

const Modal = ( { content }: any ) =>
{
  return (
    <div className={ styles_r_w.add_btn_window }>{ content }</div>
  )
}

export default Modal;