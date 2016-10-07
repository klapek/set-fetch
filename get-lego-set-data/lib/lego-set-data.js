'use strict';

const _ = require('lodash');

const isProviderVisibleInConfig = (config) => (value, key) => _.get(config, key, true);

const getProvidersInConfig = (dataProviders, config)  =>
    _.pickBy(dataProviders, isProviderVisibleInConfig(config));

const createLegoDataGetter = (dataProviders, config) => {
  const providers = getProvidersInConfig(dataProviders, config);
  return constructGetterWithProviders(providers);
};

const getProvidersData = (providers) => (setId) =>
   _.map(providers, (provider, providerName) => provider(setId)
      .then((providerData) => ({ providerName, providerData })));

function constructGetterWithProviders(providers) {
  const fetchData = getProvidersData(providers);
  return (setId) => {
    const providersDataFetch = fetchData(setId);

    return Promise.all(providersDataFetch)
        .then(function (providerObjs) {
          const result = {};

          providerObjs.forEach((providerObj)=> {
            result[providerObj.providerName] = providerObj.providerData;
          });

          return result;
        })
        .catch(console.error);
  };
};

module.exports = {
  createLegoDataGetter: (dataProviders) => (config) => createLegoDataGetter(dataProviders, config),
};
