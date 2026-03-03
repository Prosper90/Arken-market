import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function toastAlert(errorType,message, id) {
	console.log(errorType,message)
	if(errorType==='error'){

        toast.error(message, {
            autoClose: 2000,
            toastId : id,
            position: toast.POSITION.TOP_RIGHT
        });

    }else if(errorType==='success'){
        
        toast.success(message, {
            autoClose: 2000,
            toastId:id,
            position: toast.POSITION.TOP_RIGHT
        });
    }else if(errorType==='info'){
        
        toast.info(message, {
            autoClose: 2000,
            toastId:id,
            position: toast.POSITION.TOP_CENTER
        });
    }
    else if(errorType==='warn'){
        
        toast.warn(message, {
            autoClose: 2000,
            toastId:id,
            position: toast.POSITION.TOP_RIGHT
        });
    }
}