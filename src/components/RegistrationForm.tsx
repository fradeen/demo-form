import { Autocomplete, Box, Button, Container, CssBaseline, FormHelperText, Grid, InputLabel, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { SubmitHandler, useForm } from "react-hook-form"
import { InferType, number, object, string } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { ArrowRight, Done } from "@mui/icons-material"
import { useCallback, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../hooks"
import { addToList } from "./formsListSlice"


const personalDetailsSchema = object().shape({
    name: string().required().min(3, "Name must contain altest 3 characters"),
    dob: number().typeError('Age shoud be in an positive number').integer('Age shoud be in an positive number').positive('Age shoud be in an positive number').required('Age is a required field'),
    sex: string().equals(['male', 'female']).required(),
    mobile: string().when('mobile', (val, schema) => {
        if (Array.isArray(val) && val[0]) {
            return schema.matches(/^[0-9]+$/, 'Mobile number must be 10 numeric characters').min(10).max(10)
        }
        return schema.notRequired()
    }),
    govIDType: string().when('govIDType', (val, schema) => {
        if (val?.toString().trim.length > 0)
            return schema.oneOf(['aadhar', 'pan',])
        return schema.notRequired()
    }),
    govID: string().when('govIDType', ([govIDType], schema) => {
        if (!govIDType)
            return schema.notRequired()
        if (govIDType === 'aadhar')
            return string().min(12, 'Aadhar card must be of 12 numeric characters').max(12, 'Aadhar card must be of 12 numeric characters').matches(/^[2-9][0-9]+$/, 'Aadhar card number must not start from 0 or 1').required()
        else if (govIDType === 'pan')
            return string().min(10, 'Pan card must be of 10 alphanumeric characters').max(10, 'Pan card must be of 10 alphanumeric characters').required()
        else return schema.notRequired()
    }),
    address: string().optional(),
    state: string().optional(),
    city: string().optional(),
    country: string().optional(),
    pinCode: string().when('pinCode', (val, schema) => {
        if (Array.isArray(val) && val[0]) {
            return schema.matches(/^[1-9]+$/, 'Pin code should not start with 0').matches(/^[1-9][0-9]{5}$/, 'Pin code must be 6 numeric characters.').min(6).max(6)
        }
        return schema.notRequired()
    }),
}, [['govIDType', 'govIDType'], ['mobile', 'mobile'], ['pinCode', 'pinCode']])

export type personalDetails = InferType<typeof personalDetailsSchema>

export const RegistrationForm = () => {
    const { register, handleSubmit, formState: { errors }, reset, trigger } = useForm<personalDetails>({ resolver: yupResolver(personalDetailsSchema) })
    const [countryList, setCountryList] = useState<string[]>([])
    const [countryInput, setCountryinput] = useState('')
    const [isFirstStepCompleted, setFirstStepCompleted] = useState<boolean>()
    const dispatch = useAppDispatch()
    const formList = useAppSelector(state => state.formList)
    const onSubmit: SubmitHandler<personalDetails> = async (formInput) => {

        console.log("form data ---> ", formInput)
        dispatch(addToList(formInput))
        setCountryinput('')
        reset()
        setFirstStepCompleted(false)

    }

    const fetchCountryList = useCallback(async (input: string): Promise<string[]> => {
        const result: string[] = []
        try {
            if (input && input.trim().length > 0) {
                const resp = await fetch(`https://restcountries.com/v3.1/name/${input}/?fields=name`)
                const jsonResp = await resp.json()
                if (Array.isArray(jsonResp)) {
                    jsonResp.forEach(country => {
                        if (country.name)
                            result.push(country.name.common)
                    })
                }
            }
            return result
        } catch (error) {
            console.log(error)
            return result
        }
    }, [])

    useEffect(() => {
        fetchCountryList(countryInput).then((data: string[]) => { setCountryList(data) })
    }, [countryInput, fetchCountryList])


    return (
        <>
            <CssBaseline />
            <Container component="main" maxWidth='md' sx={{ display: "flex", flexDirection: "column" }}>
                <Container maxWidth='xs'>
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1
                        }}
                    >
                        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, display: "flex", flexDirection: "row", justifyContent: "space-between" }} id="demo-form" >

                            <Grid container spacing={2} flex={1} margin={'10px'} display={isFirstStepCompleted ? "none" : "flex"}>
                                <Grid xs={12} item>
                                    <Typography component="h1" variant="h5" margin={'10px'}>
                                        Enter personal Details
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField {...register('name')} label='Name' error={Boolean(errors.name)} helperText={errors.name ? errors.name.message : ""} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="Age" error={Boolean(errors.dob)} helperText={errors.dob ? errors.dob.message : ""} {...register('dob')} type="number" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField select defaultValue={undefined} label="Sex" {...register('sex')} error={Boolean(errors.sex)} helperText={errors.sex ? errors.sex.message?.toString() : ""} fullWidth >
                                        <MenuItem value='male'>Male</MenuItem>
                                        <MenuItem value='female'>Female</MenuItem>
                                    </TextField>
                                    <FormHelperText error={Boolean(errors.sex)}></FormHelperText>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField {...register('mobile')} label='Mobile' error={Boolean(errors.mobile)} helperText={errors.mobile ? errors.mobile.message : ""} type="number" />
                                </Grid>
                                <Grid item xs={12}  >
                                    <Grid container flexDirection={'row'} alignContent={'center'} justifyContent={'center'}>
                                        <Grid item xs={2}><InputLabel style={{ textWrap: 'wrap' }}>Govt Issued ID</InputLabel></Grid>
                                        <Grid item xs={4}>
                                            <TextField select {...register('govIDType')} error={Boolean(errors.govIDType)} helperText={errors.govIDType ? errors.govIDType?.message?.toString() : ""} fullWidth label='ID Type' >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value='aadhar'>Aadhar</MenuItem>
                                                <MenuItem value='pan'>PAN</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField {...register('govID')} label='Govt ID' placeholder="Enter Govt ID" error={Boolean(errors.govID)} helperText={errors.govID ? errors.govID.message : ""} />
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <Grid container flexDirection={"row-reverse"}>
                                                <Grid item >
                                                    <Button type="button" size="large" onClick={async () => {
                                                        const validationPassed = await trigger(['name', 'dob', 'sex', 'mobile', 'govID', 'govIDType'])
                                                        if (validationPassed)
                                                            setFirstStepCompleted(true)
                                                    }} >Next<ArrowRight /></Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} flex={1} margin={'10px'} display={isFirstStepCompleted ? "flex" : "none"}>
                                <Grid xs={12} item>
                                    <Typography component="h1" variant="h5" margin={'10px'}>
                                        Enter residential Details
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField {...register('address')} label='Addresss' error={Boolean(errors.address)} helperText={errors.address ? errors.address.message : ""} multiline rows={5} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="State" error={Boolean(errors.state)} helperText={errors.state ? errors.state.message : ""} {...register('state')} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField label="City" {...register('city')} error={Boolean(errors.city)} helperText={errors.city ? errors.city.message?.toString() : ""} />
                                </Grid>
                                <Grid item xs={12} sm={6} >
                                    <Autocomplete
                                        disablePortal
                                        id="combo-box-demo"
                                        options={countryList}
                                        renderInput={(params) => <TextField {...params} {...register('country')} error={Boolean(errors.country)} helperText={errors.country ? errors.country?.message?.toString() : ""} label='Country' value={countryInput} onChange={event => setCountryinput(event.target.value)} />}
                                    />

                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField {...register('pinCode')} label='Pin Code' error={Boolean(errors.pinCode)} helperText={errors.pinCode ? errors.pinCode.message : ""} type="number" />
                                </Grid>
                                <Grid item xs={12} sm={12}>
                                    <Grid container flexDirection={"row-reverse"}>
                                        <Grid item >
                                            <Button type="submit" size="large" ><Done />Submit</Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Container>
                <Box sx={{ flex: 1 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Age</TableCell>
                                    <TableCell>Sex</TableCell>
                                    <TableCell>Mobile Number</TableCell>
                                    <TableCell>Gov Id Type</TableCell>
                                    <TableCell>Gov Id</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>City</TableCell>
                                    <TableCell>Pin Code</TableCell>
                                    <TableCell>State</TableCell>
                                    <TableCell>Country</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {formList.map((data: personalDetails) => <TableRow>
                                    <TableCell>{data.name}</TableCell>
                                    <TableCell>{data.dob}</TableCell>
                                    <TableCell>{data.sex}</TableCell>
                                    <TableCell>{data.mobile}</TableCell>
                                    <TableCell>{data.govIDType}</TableCell>
                                    <TableCell>{data.govID}</TableCell>
                                    <TableCell>{data.address}</TableCell>
                                    <TableCell>{data.city}</TableCell>
                                    <TableCell>{data.pinCode}</TableCell>
                                    <TableCell>{data.state}</TableCell>
                                    <TableCell>{data.country}</TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Container >
        </>
    )
}
