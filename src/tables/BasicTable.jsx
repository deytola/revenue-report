import MaterialTable from "material-table";
import tableIcons from "./IconProvider";
import data from "./RevenueData";
import lodash from "lodash";
import format from "format-number";

/**
 * 1. Clean city data by removing unnecessary whitespaces and adjusting case
 * 2. Add new column to compute the Average Revenue/Job
 */
const reportData = data.map((currentData) => {
    currentData["locationCity"] = lodash.capitalize(currentData["locationCity"].trim());
    return currentData;
})
const groupedByFSA = lodash.groupBy(reportData, 'postalCodeFSA');
const finalReport = [];
lodash.forEach(groupedByFSA,      (value, key) => {
    let totalCompletedJobs = 0;
    let totalCompletedRevenue = 0;
    value.forEach((record) => {
        totalCompletedJobs += record["completedJobs"];
        /*
        * Clean up revenues from the given data that are in the negative form:
        * For example, -$1.00
        * */
        const revenue = record["completedRevenue"].substring(1).includes('$') ?
            parseFloat(record["completedRevenue"].substring(2)) : parseFloat(record["completedRevenue"].substring(1))
        totalCompletedRevenue += revenue;
    });
    finalReport.push({
        postalCodeFSA: key,
        locationCity: value[0]["locationCity"],
        totalCompletedJobs: totalCompletedJobs,
        totalCompletedRevenue: format({prefix: '$', round: 2})(totalCompletedRevenue),
        averageRevenuePerJob: format({prefix: '$', round: 2})(totalCompletedRevenue / totalCompletedJobs)
    });
});

const cityObj = finalReport.reduce((accumulator, currentValue) => {
    const city = currentValue.locationCity;
    if(!accumulator[city]){
        Object.assign(accumulator, {[city]: city})
    }
    return accumulator
}, {});


const columns = [
    {title: "Postal Code FSA", field: "postalCodeFSA"},
    {
        title: "City",
        field: "locationCity",
        lookup: cityObj
    },
    {title: "Completed # of Jobs", field: "totalCompletedJobs", filtering: false},
    {title: "Completed Revenue", field: "totalCompletedRevenue", filtering: false},
    {title: "Average Revenue Per Job", field: "averageRevenuePerJob", filtering: false, sorting: true}
]

export const BasicTable = () => {
    return <MaterialTable
        icons={tableIcons}
        title="Revenue Report"
        columns={columns}
        data={finalReport}
        options={{
            filtering: true,
            sorting: true,
            headerStyle: {
                backgroundColor: '#19a68e',
                color: '#FFF',
                fontWeight: 'bolder'
            },
            rowStyle: {
                backgroundColor: '#EEE',
            }
        }}
    />
}
