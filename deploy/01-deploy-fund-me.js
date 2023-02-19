/*
BU sefer islemleri daha da kisaltim normal deploy yerine su sekilde yazyas 
Bunu yapabilmeniz icin ilk once hardhat-deploy plugin eklemeniz lazim. 
daha sonra hardhat-depoly plugin bir ekstra kodu  olan yani normal deploydan buraya gelmemizi saglayan kodu calistirmamiz lazim 
o kod soyle devam ediyor yarn add -- dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers sunu ekledigimizde bizim package.json 
dosyamizda    "@nomiclabs/hardhat-ethers": "^2.0.0", => "@nomiclabs/hardhat-ethers": "npm:hardhat-deploy-ethers" suna degisiyor.
Daha sonra normalde bizim deploy foksiyonumuz soyle ilerliyordu 
//Import 
//main function
//calling main function olarak 

Burdaysa oyle bir sey yok. Biz su asagidaki 1 numarali kisma bakarsak terminale girip yarn harhdat deploy dedigimizde sonuc "Akilli ol Aklini alirim "
olucaktir. yani deploy komutu bu dosyayi calistiracaktir. 

=> 2 Nolu islemden onemli kisimlar  
hre - Hardhat Runtime Environment 
const { ethers, run, network } = require("hardhat") === async (hre) => {} ayni sey


=> 3 Nolu islemde 2 Nolu islemin kisaltmasi yani en sonunda boyle yazabiliriz sen hangisini iyi anladiysan onu yap kardesim. 

* Sonucta bu 3 islemde ayni seyi yapiyor.  

*/

const { network, deployments } = require("hardhat")
const { verify } = require("../utils/verify")
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

// // => 1- Nolu islem.
// function deployFunc(hre) {
//     console.log("Akilli ol Aklini alirim ")
//      hre.getNamedAccounts
//      hre.deployments
// }

// // =>burdada gecerli deploy fonksiyoyunu bu kodla belirliyoruz
// module.export.default = deployFunc

//2.0 Nolu islem
//Burdada ayni 1 nolu islemi yapicaz ama bu sefer isimsiz bir fonksiyon uzerinden yapicaz. Yani :
//burda hre - hardhat gibi islem goruyor yani hardhatdaki heryi import ediyormusuz gibi.
// module.exports = async hre => {
//     // 2.1 konu
//     // Bunu soyle anlayabilir hre den su fonksiyonlari cagiriyormusuz gibi
//     const { getNamedAccounts, deployments } = hre
//     // yani hre.getNamedAccounts  yada hre.deployments gibi anlayabiliriz.
// }

//Islem no : 4
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
/*
 ==> Su yukardakiyle asagidaki ayni sey sadece kisaltmak icin yukardakini kullaniyoruz. 
const helperConfig = require("../helper-hardhat-config.js")
const networkConfig = helperConfig.networkConfig
*/
//3 Nolu islem
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments // Burda deployments dan deploy ve log fonsiyonlarini cagiriyoruz.
    const { deployer } = await getNamedAccounts() // Burdada deployer fonksiyonunu cagiriyoruz.
    const chainId = network.config.chainId

    // const ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeed

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeed = ethUsdAggregator.address
    } else {
        ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // localhost yada harhdat network uzerinde calisirken biz her zaman mock kullanmamiz gerekir.
    // Mock = > gercek olan bir seyin kopyasini cikartip gercekmis gibi davranmasina yardimci oluyor. Genelde test amaciyla kullanilir.

    // Surda deploy komutu bizin sunu deploy etmemizi saglaya.
    const args = [ethUsdPriceFeed]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // priceFeed,
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("----------------------------------------------------------------")
}

module.exports.tags = ["all", "fundMe"]
