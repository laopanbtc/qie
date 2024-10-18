$(document).ready(function() {
	let connectedAddress = null;

    $('#connect').on('click', async () => {		
        if (connectedAddress) {
            connectedAddress = null;
            $('#walletAddress').text('');
            $('#connect').text('Connect');
            Swal.fire({
                title: 'Logged out!',
                text: 'You have successfully logged out.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } else {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });

                    let provider = new ethers.providers.Web3Provider(window.ethereum);
                    let signer = provider.getSigner();

                    let network = await provider.getNetwork();
                    if (network.chainId !== 1) {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: '0x1' }]
                        });

                        provider = new ethers.providers.Web3Provider(window.ethereum);
                        signer = provider.getSigner();
                    }
                    
                    connectedAddress = await signer.getAddress();
					const formattedAddress = `${connectedAddress.slice(0, 10)}.....${connectedAddress.slice(-10)}`;
                    $('#walletAddress').text(formattedAddress);
                    $('#connect').text('Logout');
                    Swal.fire({
                        title: 'Connected!',
                        text: 'You have successfully connected to your wallet.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } catch (error) {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to connect',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Wallet not supported!',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });
	
	$('#mint').on('click', async () => {
        if (!connectedAddress) {
            Swal.fire({
                title: 'Error!',
                text: 'Please connect your wallet first.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        Swal.fire({
            title: 'Processing...',
            text: 'Please wait, submitting the transaction.',
            icon: 'info',
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
        });

        try {
            if (window.ethereum) {
                let provider = new ethers.providers.Web3Provider(window.ethereum);
                let signer = provider.getSigner();

                let network = await provider.getNetwork();
                if (network.chainId !== 1) {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x1' }]
                    });

                    provider = new ethers.providers.Web3Provider(window.ethereum);
                    signer = provider.getSigner();
                }

                const CONTRACT_ADDRESS = '0xaD86b91A1D1Db15A4CD34D0634bbD4eCAcB5b61a';
                const ABI = [
                    "function mint()",
                    "function balanceOf(address) view returns (uint256)",
                ];

                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
				const balance = await contract.balanceOf(connectedAddress);
				
				if (balance > 0) {
					Swal.fire({
						title: 'Error',
						text: 'Minting has already been done.',
						icon: 'error',
						confirmButtonText: 'OK'
					});
					return;
				}

                const tx = await contract.mint();
                await tx.wait();

                Swal.fire({
                    title: 'Mint Successful!',
                    text: 'Your transaction is complete.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Wallet not supported!',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'Operation Canceled',
                text: 'The transaction was not completed or an error occurred.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    });
});
