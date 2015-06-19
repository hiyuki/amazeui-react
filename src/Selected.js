'use strict';

var React = require('react');
var classNames = require('classnames');
var ClassNameMixin = require('./mixins/ClassNameMixin');
var Dropdown = require('./Dropdown');
var Icon = require('./Icon');
var Input = require('./Input');

var Selected = React.createClass({displayName: "Selected",
    mixins: [ClassNameMixin],

    propTypes: {
        classPrefix: React.PropTypes.string,
        data: React.PropTypes.array.isRequired,
        placeholder: React.PropTypes.string,
        value: React.PropTypes.string,
        defaultValue: React.PropTypes.string,
        multiple: React.PropTypes.bool,
        searchBox: React.PropTypes.bool,
        name: React.PropTypes.string,
        onChange: React.PropTypes.func,
        optionFilter: React.PropTypes.func,
        dropup: React.PropTypes.bool,
        btnWidth: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.string]),
        btnStyle: React.PropTypes.string,
        btnSize: React.PropTypes.string,
        maxHeight: React.PropTypes.number
    },

    getDefaultProps: function () {
        return {
            classPrefix: 'selected',
            placeholder: '点击选择...',
            onChange: function () {
            },
            optionFilter: function (filterText, option) {
                return (option.label.toLowerCase().indexOf(filterText) > -1);
            }
        };
    },

    getInitialState: function () {
        return {
            value: this.props.defaultValue || this.props.value,
            dropdownWidth: null,
            filterText: null
        };
    },

    componentWillReceiveProps: function (nextProps) {
        if (nextProps.value !== undefined && nextProps.value !== null) {
            this.setState({value: nextProps.value});
        }
    },


    componentDidMount: function () {
        this.setDropdownWidth();
    },

    setDropdownWidth: function () {
        if (this.isMounted()) {
            var toggleButton = React.findDOMNode(this.refs.dropdown.
                refs.dropdownToggle);

            toggleButton && this.setState({dropdownWidth: toggleButton.offsetWidth});
        }
    },

    getValueArray: function () {
        return this.state.value ? this.state.value.split(',') : [];
    },

    hasValue: function (value) {
        return this.getValueArray().indexOf(value) > -1;
    },

    setValue: function (value) {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(value);
        }
        this.setState({
            value: value
        });
    },

    handleCheck: function (option, e) {
        e.preventDefault();

        var clickedValue = option.value;

        // multiple select
        if (this.props.multiple) {
            var values = this.getValueArray();

            if (this.hasValue(clickedValue)) {
                values.splice(values.indexOf(clickedValue), 1);
            } else {
                values.push(clickedValue);
            }
            if (this.props.value !== undefined && this.props.value !== null) {
                this.props.onChange(values.join(','));
            }
            else {
                this.setValue(values.join(','));
            }
        } else {
            if (this.props.value !== undefined && this.props.value !== null) {
                this.props.onChange(clickedValue);
            }
            else {
                this.setValue(clickedValue);
            }
            this.refs.dropdown.setDropdownState(false);
        }
    },

    handleUserInput: function (e) {
        e.preventDefault();

        this.setState({
            filterText: React.findDOMNode(this.refs.filterInput).value
        });
    },

    // clear filter
    clearFilterInput: function () {
        if (this.props.multiple && this.props.searchBox) {
            this.setState({
                filterText: null
            });
            React.findDOMNode(this.refs.filterInput).value = null;
        }
    },

    // API for getting component value
    getValue: function () {
        return this.state.value;
    },

    render: function () {
        var classSet = this.getClassSet();
        var selectedLabel = [];
        var items = [];
        var filterText = this.state.filterText;
        var groupHeader;

        this.props.data.forEach(function (option, i) {
            var checked = this.hasValue(option.value);
            var checkedClass = checked ? this.setClassNamespace('checked') : null;
            var checkedIcon = checked ? React.createElement(Icon, {icon: "check"}) : null;

            checked && selectedLabel.push(option.label);

            // add group header
            if (option.group && groupHeader !== option.group) {
                groupHeader = option.group;
                items.push(
                    React.createElement("li", {
                            className: this.prefixClass('list-header'),
                            key: 'header' + i},
                        groupHeader
                    )
                );
            }

            if (filterText && !this.props.optionFilter(filterText, option)) {
                return;
            }

            items.push(
                React.createElement("li", {
                        className: checkedClass,
                        onClick: this.handleCheck.bind(this, option),
                        key: i},
                    React.createElement("span", {className: this.prefixClass('text')},
                        option.label
                    ),
                    checkedIcon
                )
            );
        }.bind(this));

        var status = (
            React.createElement("span", {
                    className: classNames(this.prefixClass('status'),
                        this.setClassNamespace('fl'))},
                selectedLabel.length ? selectedLabel.join(', ') : (
                    React.createElement("span", {className: this.prefixClass('placeholder ')},
                        this.props.placeholder
                    ))
            )
            );
        var optionsStyle = {};

        if (this.props.maxHeight) {
            optionsStyle = {
                maxHeight: this.props.maxHeight,
                overflowY: 'scroll'
            };
        }

        return (
            React.createElement(Dropdown, {
                    className: classNames(this.props.className, classSet),
                    title: status,
                    onClose: this.clearFilterInput,
                    btnStyle: this.props.btnStyle,
                    btnSize: this.props.btnSize,
                    btnInlineStyle: {width: this.props.btnWidth},
                    contentInlineStyle: {minWidth: this.state.dropdownWidth},
                    toggleClassName: this.prefixClass('btn'),
                    caretClassName: this.prefixClass('icon'),
                    contentClassName: this.prefixClass('content'),
                    contentTag: "div",
                    dropup: this.props.dropup,
                    ref: "dropdown"},
                this.props.searchBox ? (
                    React.createElement("div", {className: this.prefixClass('search')},
                        React.createElement(Input, {
                            onChange: this.handleUserInput,
                            autoComplete: "off",
                            standalone: true,
                            ref: "filterInput"})
                    )) : null,
                React.createElement("ul", {
                        style: optionsStyle,
                        className: this.prefixClass('list')},
                    items
                ),
                React.createElement("input", {
                    name: this.props.name,
                    type: "hidden",
                    ref: "selectedField",
                    value: this.state.value})
            )
            );
    }
});

            module.exports = Selected;