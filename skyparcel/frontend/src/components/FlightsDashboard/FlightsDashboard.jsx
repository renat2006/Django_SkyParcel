import React, {useState} from 'react';
import {Select, SIZE} from 'baseui/select';
import axios from 'axios';
import {FormControl} from "baseui/form-control";
import {isAfter, isBefore} from 'date-fns';
import {DatePicker, TimePicker} from "baseui/datepicker";
import {FlexGrid, FlexGridItem} from "baseui/flex-grid";
import PropTypes from "prop-types";

const fetchCities = async (inputValue) => {
    try {
        const response = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?text=${inputValue}&apiKey=40f195dcf70340788eabb94c0ffbc0df`);
        return response.data.features.map(city => ({
            label: city.properties.formatted, id: city.properties.city
        }));
    } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
    }
};

const commonSelectOverrides = {
    ControlContainer: {
        style: () => ({
            borderRadius: '0px',
        })
    }
};

const componentStyleOverrides = (index, windowWidth, $theme) => {
    let style = {};

    const selectStyle = (topLeft, topRight, bottomLeft, bottomRight) => {
        return {
            borderTopLeftRadius: topLeft ? $theme.borders.radius400 : '0px',
            borderTopRightRadius: topRight ? $theme.borders.radius400 : '0px',
            borderBottomLeftRadius: bottomLeft ? $theme.borders.radius400 : '0px',
            borderBottomRightRadius: bottomRight ? $theme.borders.radius400 : '0px',
        }
    };

    if (windowWidth >= 1500) {
        if (index === 0) {
            style = selectStyle(true, false, true, false);
        } else if (index === 5) {
            style = selectStyle(false, true, false, true);
        } else {
            style = selectStyle(false, false, false, false);
        }
    } else if (windowWidth >= 900) {
        if (index === 0) {
            style = selectStyle(true, false, false, false);
        } else if (index === 2) {
            style = selectStyle(false, true, false, false);
        } else if (index === 3) {
            style = selectStyle(false, false, true, false);
        } else if (index === 5) {
            style = selectStyle(false, false, false, true);
        } else {
            style = selectStyle(false, false, false, false);
        }
    } else if (windowWidth >= 600) {
        if (index === 0) {
            style = selectStyle(true, false, false, false);
        } else if (index === 1) {
            style = selectStyle(false, true, false, false);
        } else if (index === 4) {
            style = selectStyle(false, false, true, false);
        } else if (index === 5) {
            style = selectStyle(false, false, false, true);
        } else {
            style = selectStyle(false, false, false, false);
        }
    } else {
        if (index === 0) {
            style = selectStyle(true, true, false, false);
        } else if (index === 5) {
            style = selectStyle(false, false, true, true);
        } else {
            style = selectStyle(false, false, false, false);
        }
    }

    return style;
};

export default function FlightsDashboard({windowWidth, onFilterChange, cities}) {

    const getColumnCount = () => {
        if (windowWidth < 600) return 1;
        if (windowWidth < 900) return 2;
        if (windowWidth < 1500) return 3;
        return 6;
    };

    const [formData, setFormData] = useState({
        departureCityOptions: [],
        departureCity: [],
        arrivalCityOptions: [],
        arrivalCity: [],
        dates: [new Date(), new Date()],
        departureTime: null,
        arrivalTime: null
    });

    const loadOptions = async (inputValue, optionType) => {
        const options = await fetchCities(inputValue);
        setFormData(prevData => ({...prevData, [optionType]: options}));
    };

    const handleCityChange = (value, field) => {
        setFormData(prevData => ({...prevData, [field]: value}));
        onFilterChange({...formData, [field]: value});
    };

    const handleDateChange = (date, index) => {
        const newDates = [...formData.dates];
        newDates[index] = date;
        if (index === 0 && isAfter(date, formData.dates[1])) {
            newDates[1] = date;
        } else if (index === 1 && isBefore(date, formData.dates[0])) {
            newDates[0] = date;
        }
        setFormData(prevData => ({...prevData, dates: newDates}));
        onFilterChange({...formData, dates: newDates});
    };

    const handleTimeChange = (time, field) => {
        setFormData(prevData => ({...prevData, [field]: time}));
        onFilterChange({...formData, [field]: time});
    };

    return (
        <FormControl>
            <FlexGrid
                flexGridColumnCount={getColumnCount()}
                flexGridColumnGap="scale0"
                flexGridRowGap="scale0"
            >
                <FlexGridItem>
                    <Select
                        size={SIZE.large}
                        options={cities?.departureCities ? cities.departureCities : []}
                        value={formData.departureCity}
                        onInputChange={event => loadOptions(event.currentTarget.value, 'departureCityOptions')}
                        onChange={params => handleCityChange(params.value, 'departureCity')}
                        placeholder="Город отправления"
                        overrides={{
                            ControlContainer: {
                                style: ({$theme}) => componentStyleOverrides(0, windowWidth, $theme)
                            }
                        }}
                    />
                </FlexGridItem>
                <FlexGridItem>
                    <Select
                        size={SIZE.large}
                        options={cities?.arrivalCities ? cities.arrivalCities : []}
                        value={formData.arrivalCity}
                        onInputChange={event => loadOptions(event.currentTarget.value, 'arrivalCityOptions')}
                        onChange={params => handleCityChange(params.value, 'arrivalCity')}
                        placeholder="Город прибытия"
                        overrides={{
                            ControlContainer: {
                                style: ({$theme}) => componentStyleOverrides(1, windowWidth, $theme)
                            }
                        }}
                    />
                </FlexGridItem>
                <FlexGridItem>
                    <DatePicker
                        size={SIZE.large}
                        value={formData.dates[0]}
                        onChange={({date}) => handleDateChange(date, 0)}
                        placeholder="Дата вылета"
                        overrides={{
                            Input: {
                                props: {
                                    overrides: {
                                        Root: {
                                            style: ({$theme}) => (
                                                {...commonSelectOverrides.ControlContainer.style, ...componentStyleOverrides(2, windowWidth, $theme)})
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </FlexGridItem>
                <FlexGridItem>
                    <TimePicker
                        size={SIZE.large}
                        value={formData.dates[0]}
                        onChange={time => handleTimeChange(time, 'departureTime')}
                        format="24"
                        placeholder="Время вылета"
                        overrides={{
                            Select: {
                                props: {
                                    overrides: {
                                        ControlContainer: {
                                            style: ({$theme}) => componentStyleOverrides(3, windowWidth, $theme)
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </FlexGridItem>
                <FlexGridItem>
                    <DatePicker
                        size={SIZE.large}
                        value={formData.dates[1]}
                        onChange={({date}) => handleDateChange(date, 1)}
                        placeholder="Дата прилета"
                        overrides={{
                            Input: {
                                props: {
                                    overrides: {
                                        Root: {
                                            style: ({$theme}) => (
                                                {...commonSelectOverrides.ControlContainer.style, ...componentStyleOverrides(4, windowWidth, $theme)})
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </FlexGridItem>
                <FlexGridItem>
                    <TimePicker
                        size={SIZE.large}
                        value={formData.dates[1]}
                        onChange={time => handleTimeChange(time, 'arrivalTime')}
                        format="24"
                        placeholder="Время прилета"
                        overrides={{
                            Select: {
                                props: {
                                    overrides: {
                                        ControlContainer: {
                                            style: ({$theme}) => componentStyleOverrides(5, windowWidth, $theme)
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </FlexGridItem>
            </FlexGrid>
        </FormControl>
    );
}

FlightsDashboard.propTypes = {
    windowWidth: PropTypes.any,
    onFilterChange: PropTypes.func.isRequired
}
