/**
 * wishlist - core.containers/AppContainer
 *
 * Created by nijk on 05/11/15.
 */

'use strict';

// Dependencies
const _ = require('lodash');
const core = require('core/Core');
const React = require('react');
const transform = require('../../../common/transforms');
const routes = require('../../../common/enums.routes');

// Components
const List = require('../components/List');

/* Styles */
/* ------ */

const Wishlists = React.createClass({
    displayName: 'Wishlists',

    mixins: [
        core.FluxMixin,
        core.StoreWatchMixin('Wishlists')
    ],

    getStateFromFlux () {
        const wishlistsStore = core.store('Wishlists');

        return {
            wishlists: wishlistsStore.getWishlists()
        };
    },

    componentDidMount () {
        core.actions.getWishlists();
    },

    onClickItem (e) {
        e.preventDefault();

    },

    _renderWishlists () {
        const wishlists = _.map(this.state.wishlists, (item) => {
            return {
                name: item.name,
                link: {
                    title: item.name,
                    url: transform.route(routes.wishlist, { id: item._id })
                }
            }
        });

        return <List key="wishlists" items={ wishlists } />;
    },

    render () {
        return _.size(this.state.wishlists) > 0 ? this._renderWishlists() : null;
    }
});

module.exports = Wishlists;
