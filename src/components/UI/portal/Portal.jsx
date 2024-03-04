import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
    const portalContainer = document.getElementById('portal');

    if (!portalContainer) {
        const newPortalContainer = document.createElement('div');
        newPortalContainer.id = 'portal';
        document.body.appendChild(newPortalContainer);
    }

    return ReactDOM.createPortal(children, document.getElementById('portal'));
};

export default Portal;