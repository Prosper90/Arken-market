import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function toastAlert(errorType, message, id, 
    position = 'TOP_RIGHT' //TOP_RIGHT, TOP_CENTER
) {

    if (errorType === 'error') {
        toast.error(message, {
            autoClose: 2000,
            toastId: id,
            position: toast.POSITION[position],
        });

    } else if (errorType === 'success') {
        toast.success(message, {
            autoClose: 2000,
            toastId: id,
            position: toast.POSITION[position],
        });
    } else if (errorType === 'warning') {
        toast.warning(message, {
            autoClose: 2000,
            toastId: id,
            position: toast.POSITION[position],
        });
    }
}