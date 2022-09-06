module.exports = {
    getReservesABI: [
        "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    ],

    factoryABI: [
        "function getPair(address, address) view returns (address pair)"
    ],
}