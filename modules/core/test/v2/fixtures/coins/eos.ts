export const transactions = {
  transferTransaction: {
    signatures: [],
    serializedTransaction: new Uint8Array(
      Buffer.from(
        '33af835d640064000000000000000100a6823403ea3055000000572d3ccdcd010000000080d0553400000000a8ed32322a0000000080d055340000000080e4b6491027000000000000045359530000000009536f6d65206d656d6f00',
        'hex',
      ),
    ),
    serializedContextFreeData: null,
  },

  stakeTransaction: {
    signatures: [],
    serializedTransaction: new Uint8Array(
      Buffer.from(
        '33af835d64006400000000000000010000000000ea305500003f2a1ba6a24a010000000080d0553400000000a8ed3232310000000080d055340000000080e4b64910270000000000000453595300000000102700000000000004535953000000000000',
        'hex',
      ),
    ),
    serializedContextFreeData: null,
  },

  doubleStakeTransaction: {
    signatures: [],
    serializedTransaction: new Uint8Array(
      Buffer.from(
        '33af835d64006400000000000000020000000000ea305500003f2a1ba6a24a010000000080d0553400000000a8ed3232310000000080d055340000000080e4b6491027000000000000045359530000000010270000000000000453595300000000000000000000ea305500003f2a1ba6a24a010000000080d0553400000000a8ed3232310000000080d055340000000080e4b64910270000000000000453595300000000102700000000000004535953000000000000',
        'hex',
      ),
    ),
    serializedContextFreeData: null,
  },

  unstakeTransaction: {
    signatures: [],
    serializedTransaction: new Uint8Array(
      Buffer.from(
        '33af835d64006400000000000000010000000000ea3055c08fca86a9a8d2d4010000000080d0553400000000a8ed3232300000000080d055340000000080e4b649102700000000000004535953000000001027000000000000045359530000000000',
        'hex',
      ),
    ),
    serializedContextFreeData: null,
  },

  updateAuthTransaction: {
    signatures: [],
    serializedTransaction: new Uint8Array(
      Buffer.from(
        '33af835d64006400000000000000010000000000ea30550040cbdaa86c52d5010000000080d0553400000000a8ed3232550000000080d055340000905755a024c500000000a8ed323201000000010003a2a70865b500e3e9347c009d944bf8a3b42a32dac02fe465b51bc93699a20d110100010000000080d0553400000000a8ed323201000000',
        'hex',
      ),
    ),
    serializedContextFreeData: null,
  },

  deleteAuthTransaction: {
    signatures: [],
    serializedTransaction: new Uint8Array(
      Buffer.from(
        '33af835d64006400000000000000010000000000ea30550040cbdaa8aca24a010000000080d0553400000000a8ed3232100000000080d055340000905755a024c500',
        'hex',
      ),
    ),
    serializedContextFreeData: null,
  },

  linkAuthTransaction: {
    signatures: [],
    serializedTransaction: new Uint8Array(
      Buffer.from(
        '33af835d64006400000000000000010000000000ea30550000002d6b03a78b010000000080d0553400000000a8ed3232200000000080d055340000000080d055340000001919a024c500e455154cea323200',
        'hex',
      ),
    ),
    serializedContextFreeData: null,
  },

  unlinkAuthTransaction: {
    signatures: [],
    serializedTransaction: new Uint8Array(
      Buffer.from(
        '33af835d64006400000000000000010000000000ea30550040cbdac0e9e2d4010000000080d0553400000000a8ed3232180000000080d055340000000080d055340000001919a024c500',
        'hex',
      ),
    ),
    serializedContextFreeData: null,
  },
};
