import { expect } from 'chai';

export const expectSuccess = (result: any) => {
    expect(result).to.have.property('success', true);
};

export const expectTxHash = (hash: string) => {
    expect(hash).to.match(/^0x[a-fA-F0-9]{64}$/);
};

export const expectExplorerUrl = (url: string | undefined) => {
    if (url) expect(url).to.include('https://');
};