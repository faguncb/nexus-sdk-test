import sinon from 'sinon';

export const createAutoApproveIntentHook = () => {
    return sinon.spy(({ allow }) => allow());
};

export const createAutoApproveAllowanceHook = () => {
    return sinon.spy(({ allow }) => allow(['min']));
};